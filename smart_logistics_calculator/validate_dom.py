"""
Precisely validate the lean-section HTML structure using Python's html.parser.
Check whether the browser DOM tree matches what we expect.
"""
from html.parser import HTMLParser
import re

class DivTracer(HTMLParser):
    def __init__(self, start_line, end_line, lines):
        super().__init__()
        self.start_line = start_line
        self.end_line = end_line
        self.lines = lines
        self.stack = []  # Stack of (tag, line, attrs_dict)
        self.issues = []
        self.current_line = 0
        
    def handle_starttag(self, tag, attrs):
        if tag in ('div', 'section', 'details', 'summary'):
            attrs_dict = dict(attrs)
            self.stack.append((tag, self.getpos()[0] + self.start_line - 1, attrs_dict))
            
    def handle_endtag(self, tag):
        if tag in ('div', 'section', 'details', 'summary'):
            line = self.getpos()[0] + self.start_line - 1
            if self.stack and self.stack[-1][0] == tag:
                opened_tag, opened_line, opened_attrs = self.stack.pop()
                opened_id = opened_attrs.get('id', '')
                # Only log interesting closings
            elif self.stack:
                # Tag mismatch - we expected to close the current top, but got a different tag
                expected = self.stack[-1]
                self.issues.append(f"Line {line}: Closing </{tag}> but expected </{expected[0]}> (opened at line {expected[1]}, id={expected[2].get('id', 'none')})")
                # Try to find matching open tag
                for i in range(len(self.stack)-1, -1, -1):
                    if self.stack[i][0] == tag:
                        # Close all tags up to this one (implicit closes)
                        while len(self.stack) > i:
                            closed = self.stack.pop()
                            if closed[0] != tag or len(self.stack) > i:
                                self.issues.append(f"  -> Implicitly closing <{closed[0]}> (opened at line {closed[1]}, id={closed[2].get('id', 'none')})")
                        break
                else:
                    self.issues.append(f"  -> No matching open tag found for </{tag}> at line {line}")
            else:
                self.issues.append(f"Line {line}: Extra </{tag}> with empty stack")


with open('index.html', 'r', encoding='utf-8') as f:
    all_lines = f.readlines()

# Find the lean-section boundaries
lean_start = None
lean_end = None
for i, line in enumerate(all_lines, 1):
    if 'id="lean-section"' in line:
        lean_start = i
    if lean_start and '</section>' in line and i > lean_start + 10:
        lean_end = i
        break

print(f"Lean section: lines {lean_start} to {lean_end}")
section_html = ''.join(all_lines[lean_start-1:lean_end])

tracer = DivTracer(lean_start, lean_end, all_lines)
tracer.feed(section_html)

if tracer.issues:
    print(f"\n*** FOUND {len(tracer.issues)} ISSUES ***")
    for issue in tracer.issues:
        print(f"  {issue}")
else:
    print("\nNo nesting issues found")

if tracer.stack:
    print(f"\n*** {len(tracer.stack)} UNCLOSED TAGS ***")
    for tag, line, attrs in tracer.stack:
        print(f"  <{tag}> opened at line {line}, id={attrs.get('id', 'none')}")
else:
    print("\nAll tags properly closed")


# Also check: does ref5whys.closest('.lean-panel') === leanPanel-reference?
# Simulate closest by checking nesting
print("\n--- Checking if ref5whys is inside leanPanel-reference ---")
in_ref_panel = False
ref5whys_found = False
depth_since_panel = 0
for i, line in enumerate(all_lines[lean_start-1:lean_end], lean_start):
    opens = len(re.findall(r'<div[\s>]', line))
    closes = len(re.findall(r'</div>', line))
    
    if 'id="leanPanel-reference"' in line:
        in_ref_panel = True
        depth_since_panel = 0
        print(f"  leanPanel-reference opens at line {i}")
    
    if in_ref_panel:
        depth_since_panel += opens - closes
        
        if 'id="ref5whys"' in line:
            ref5whys_found = True
            print(f"  ref5whys found at line {i}, depth from panel: {depth_since_panel}")
        
        if depth_since_panel <= 0 and i > lean_start + 100:
            print(f"  leanPanel-reference effectively closes at line {i}")
            if not ref5whys_found:
                print(f"  *** ref5whys NOT found before panel close! ***")
            break
