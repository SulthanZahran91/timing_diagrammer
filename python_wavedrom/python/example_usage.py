#!/usr/bin/env python3
"""
Example usage of the WaveDromProject class.

This demonstrates how to use the WaveDromProject class to load and parse
WaveDrom JSON5 files or raw strings.
"""

from wavedrom_project import WaveDromProject


def main():
    print("=== WaveDromProject Usage Examples ===\n")
    
    # Example 1: Load from file
    print("Example 1: Loading signal diagram from file")
    try:
        project = WaveDromProject('../wavedrom/test/signal-step4.json5')
        print(f"✓ Loaded {project.diagram_type} diagram")
        print(f"  Source keys: {list(project.source.keys())}")
        print(f"  Signal count: {len(project.source['signal'])}")
        print(f"  Config: {project.config}")
        print()
    except Exception as e:
        print(f"✗ Error: {e}\n")
    
    # Example 2: Parse raw JSON5 string
    print("Example 2: Parsing raw JSON5 string")
    raw_json5 = """{ 
        signal: [
            { name: 'clock', wave: 'p.....' },
            { name: 'data',  wave: 'x.345x' }
        ],
        config: { hscale: 1 }
    }"""
    
    try:
        project = WaveDromProject(raw_json5)
        print(f"✓ Parsed {project.diagram_type} diagram")
        print(f"  Signal count: {len(project.source['signal'])}")
        print(f"  Config: {project.config}")
        print()
    except Exception as e:
        print(f"✗ Error: {e}\n")
    
    # Example 3: Load register diagram
    print("Example 3: Loading register diagram")
    try:
        project = WaveDromProject('../wavedrom/test/reg-vl.json5')
        print(f"✓ Loaded {project.diagram_type} diagram")
        print(f"  Register entries: {len(project.source['reg'])}")
        print()
    except Exception as e:
        print(f"✗ Error: {e}\n")
    
    # Example 4: Error handling
    print("Example 4: Error handling for invalid input")
    try:
        project = WaveDromProject('{ invalid: json }')
        print("✗ This should have failed!")
    except ValueError as e:
        print(f"✓ Correctly caught error: {e}")


if __name__ == "__main__":
    main() 