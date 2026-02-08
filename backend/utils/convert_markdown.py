
import os
from pathlib import Path
import sys
from markitdown import MarkItDown

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.create_chunks_semantic import process_markdown_file

# file input and output paths to convert and output in markdown format
input_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

def convert_tables_to_records(markdown_content):
    """
    Converts markdown tables to single-line key-value record format (optimized for RAG)
    """
    import re
    
    lines = markdown_content.split('\n')
    processed_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check if this line starts a table
        if (line.strip() and line.strip().startswith('|')) and \
           (i + 1 < len(lines) and re.match(r'^\s*\|\s*[-:]+\s*(\|\s*[-:]+\s*)*\|\s*$', lines[i + 1])):
            
            # Get the header row
            header_line = lines[i].strip().strip('|').strip()
            headers = [header.strip() for header in header_line.split('|')]
            
            # Find the end of the table
            j = i + 2  # Start after header and separator
            while j < len(lines) and lines[j].strip().startswith('|'):
                j += 1
            
            # Process each data row
            for k in range(i + 2, j):  # Skip header and separator
                data_line = lines[k].strip().strip('|').strip()
                data_cells = [cell.strip() for cell in data_line.split('|')]
                
                # Create a single record with key-value pairs
                record_parts = []
                for idx, (header, value) in enumerate(zip(headers, data_cells)):
                    if header and value:  # Only include if both exist
                        # Clean up the value to remove problematic characters
                        clean_value = value.replace('\n', ' ').replace('\r', ' ')
                        record_parts.append(f"{header.strip()}: {clean_value}")
                
                if record_parts:  # Only add if there's actual content
                    record_line = " | ".join(record_parts)
                    processed_lines.append(f"RECORD: {record_line}")
            
            i = j  # Skip the processed table lines
        else:
            processed_lines.append(line)
            i += 1
    
    return '\n'.join(processed_lines)

def convert_to_markdown(
    input_dir,
    output_dir=None,  # optional
    target_formats=(".docx", ".xlsx", ".pdf", ".pptx"),
    ):
    input_path = Path(input_dir)
    
    print(f"Converting files in {input_path}")
    md = MarkItDown()

    for file_path in input_path.rglob("*"):
        if file_path.suffix in target_formats:
            try:
                result = md.convert(file_path)
                
                # Process the markdown content to convert tables to single-line records
                processed_markdown = convert_tables_to_records(result.markdown)
                
            except Exception as e:
                print(f"✗ Error converting {file_path.name}: {e}")
                continue

            output_file = file_path.parent / f"{file_path.stem}{file_path.suffix}.md"
            
            output_file.write_text(processed_markdown, encoding="utf-8")
            print(f"✓ Converted {file_path.name} → {output_file.name}")

def convert_to_markdown_single(
    filepath,
    output_dir=None,  # optional
    target_formats=(".docx", ".xlsx", ".pdf", ".pptx"),
    ):
    file_path = Path(filepath)
    
    # Check if the file exists
    if not file_path.exists():
        print(f"✗ File does not exist: {file_path}")
        return
    
    # Check if the file format is supported
    if file_path.suffix not in target_formats:
        print(f"✗ Unsupported file format: {file_path.suffix}")
        return
        
    print(f"Converting file: {file_path}")
    md = MarkItDown()

    try:
        result = md.convert(file_path)
        
        # Process the markdown content to convert tables to single-line records
        processed_markdown = convert_tables_to_records(result.markdown)
        
        # Determine output path
        if output_dir:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)  # Create output dir if needed
            output_file = output_path / f"{file_path.stem}.md"
        else:
            output_file = file_path.with_suffix('.md')
        
        output_file.write_text(processed_markdown, encoding="utf-8")

        # Create chunks and embeddings
        process_markdown_file(output_file)

        print(f"✓ Converted {file_path.name} → {output_file.name}")
        

    except Exception as e:
        print(f"✗ Error converting {file_path.name}: {e}")