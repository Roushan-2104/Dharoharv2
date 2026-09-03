import zipfile
import xml.etree.ElementTree as ET

def read_docx(path, out_path):
    try:
        with zipfile.ZipFile(path, 'r') as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            paragraphs = tree.findall('.//w:p', namespaces)
            
            with open(out_path, 'w', encoding='utf-8') as f:
                for p in paragraphs:
                    texts = p.findall('.//w:t', namespaces)
                    if texts:
                        f.write(''.join(t.text for t in texts) + '\n')
                    else:
                        f.write('\n')
    except Exception as e:
        print(f"Error: {e}")

read_docx('Digital_Heritage_Knowledge_System_Full_Document.docx', 'docx_content.txt')
