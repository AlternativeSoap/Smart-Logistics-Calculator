import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find reference panel section
start = content.find('id="leanPanel-reference"')
end = content.find('</div><!-- /leanPanel-reference -->')
section = content[start:end+35]

# Count divs
opens = len(re.findall(r'<div[\s>]', section))
closes = len(re.findall(r'</div>', section))
print(f'Open divs: {opens}, Close divs: {closes}, Balanced: {opens == closes}')

# Find all section box IDs
box_ids = re.findall(r'id="([^"]+)"\s+class="lean-searchable lean-section-box', section)
print(f'\nSection boxes in reference panel ({len(box_ids)}):')
for bid in box_ids:
    print(f'  - {bid}')

# Check nesting: for each box, verify it has correct number of inner divs
for bid in box_ids:
    box_start = section.find(f'id="{bid}"')
    next_boxes = [section.find(f'id="{nb}"', box_start+1) for nb in box_ids if section.find(f'id="{nb}"', box_start+1) > 0]
    if next_boxes:
        box_end = min(next_boxes)
    else:
        box_end = len(section)
    box_section = section[box_start:box_end]
    inner_opens = len(re.findall(r'<div[\s>]', box_section))
    inner_closes = len(re.findall(r'</div>', box_section))
    balanced = 'OK' if inner_opens == inner_closes else f'MISMATCH (opens={inner_opens}, closes={inner_closes})'
    print(f'  {bid}: {balanced}')
