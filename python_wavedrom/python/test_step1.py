#!/usr/bin/env python3
"""
Test script for WaveDromProject class - Step 1 verification.

This script tests the core functionality of the WaveDromProject class
including file loading, JSON5 parsing, and diagram type detection.
"""

import os
import sys
from wavedrom_project import WaveDromProject


def test_signal_file():
    """Test Case 1: Load signal-step4.json5 file."""
    print("Test Case 1: Testing signal file...")
    
    # Path to the test file (relative to wavedrom folder)
    file_path = "../wavedrom/test/signal-step4.json5"
    
    try:
        project = WaveDromProject(file_path)
        
        # Assertions
        assert project.diagram_type == 'signal', f"Expected 'signal', got '{project.diagram_type}'"
        assert isinstance(project.source, dict), f"Expected dict, got {type(project.source)}"
        assert 'signal' in project.source, "Missing 'signal' key in source"
        
        print("✓ Test Case 1 PASSED")
        print(f"  - Diagram type: {project.diagram_type}")
        print(f"  - Source keys: {list(project.source.keys())}")
        print(f"  - Signal count: {len(project.source['signal'])}")
        
    except Exception as e:
        print(f"✗ Test Case 1 FAILED: {e}")
        return False
    
    return True


def test_reg_file():
    """Test Case 2: Load reg-vl.json5 file."""
    print("\nTest Case 2: Testing reg file...")
    
    file_path = "../wavedrom/test/reg-vl.json5"
    
    try:
        project = WaveDromProject(file_path)
        
        # Assertions
        assert project.diagram_type == 'reg', f"Expected 'reg', got '{project.diagram_type}'"
        assert isinstance(project.source, dict), f"Expected dict, got {type(project.source)}"
        assert 'reg' in project.source, "Missing 'reg' key in source"
        
        print("✓ Test Case 2 PASSED")
        print(f"  - Diagram type: {project.diagram_type}")
        print(f"  - Source keys: {list(project.source.keys())}")
        print(f"  - Reg entries: {len(project.source['reg'])}")
        
    except Exception as e:
        print(f"✗ Test Case 2 FAILED: {e}")
        return False
    
    return True


def test_raw_string():
    """Test Case 3: Parse raw JSON5 string."""
    print("\nTest Case 3: Testing raw string...")
    
    raw_string = "{ signal: [ { name: 'test', wave: '01' } ] }"
    
    try:
        project = WaveDromProject(raw_string)
        
        # Assertions
        assert project.diagram_type == 'signal', f"Expected 'signal', got '{project.diagram_type}'"
        assert isinstance(project.source, dict), f"Expected dict, got {type(project.source)}"
        assert 'signal' in project.source, "Missing 'signal' key in source"
        assert len(project.source['signal']) == 1, f"Expected 1 signal, got {len(project.source['signal'])}"
        assert project.source['signal'][0]['name'] == 'test', "Signal name mismatch"
        assert project.source['signal'][0]['wave'] == '01', "Signal wave mismatch"
        
        print("✓ Test Case 3 PASSED")
        print(f"  - Diagram type: {project.diagram_type}")
        print(f"  - Parsed signal: {project.source['signal'][0]}")
        
    except Exception as e:
        print(f"✗ Test Case 3 FAILED: {e}")
        return False
    
    return True


def test_invalid_inputs():
    """Test Case 4: Test invalid inputs and error handling."""
    print("\nTest Case 4: Testing invalid inputs...")
    
    test_cases = [
        {
            'name': 'Non-existent file',
            'input': 'non_existent_file.json5',
            'expected_error': FileNotFoundError
        },
        {
            'name': 'Invalid JSON5',
            'input': '{ invalid json }',
            'expected_error': ValueError
        },
        {
            'name': 'Missing required keys',
            'input': '{ "config": {} }',
            'expected_error': ValueError
        },
        {
            'name': 'Non-object root',
            'input': '["not", "an", "object"]',
            'expected_error': ValueError
        },
        {
            'name': 'Invalid signal format',
            'input': '{ "signal": "not an array" }',
            'expected_error': ValueError
        }
    ]
    
    all_passed = True
    
    for i, test_case in enumerate(test_cases):
        try:
            project = WaveDromProject(test_case['input'])
            print(f"✗ Test Case 4.{i+1} FAILED: Expected {test_case['expected_error'].__name__} but got success")
            all_passed = False
        except test_case['expected_error'] as e:
            print(f"✓ Test Case 4.{i+1} PASSED: {test_case['name']} - {type(e).__name__}")
        except Exception as e:
            print(f"✗ Test Case 4.{i+1} FAILED: {test_case['name']} - Expected {test_case['expected_error'].__name__}, got {type(e).__name__}: {e}")
            all_passed = False
    
    return all_passed


def test_attribute_extraction():
    """Additional test: Verify config, head, foot extraction."""
    print("\nAdditional Test: Testing attribute extraction...")
    
    raw_string = """{ 
        signal: [ { name: 'test', wave: '01' } ],
        config: { hscale: 2 },
        head: { text: 'Header' },
        foot: { text: 'Footer' }
    }"""
    
    try:
        project = WaveDromProject(raw_string)
        
        # Assertions
        assert isinstance(project.config, dict), "Config should be a dict"
        assert isinstance(project.head, dict), "Head should be a dict"
        assert isinstance(project.foot, dict), "Foot should be a dict"
        assert project.config.get('hscale') == 2, "Config hscale mismatch"
        assert project.head.get('text') == 'Header', "Head text mismatch"
        assert project.foot.get('text') == 'Footer', "Footer text mismatch"
        
        print("✓ Attribute extraction test PASSED")
        print(f"  - Config: {project.config}")
        print(f"  - Head: {project.head}")
        print(f"  - Foot: {project.foot}")
        
    except Exception as e:
        print(f"✗ Attribute extraction test FAILED: {e}")
        return False
    
    return True


def main():
    """Run all test cases."""
    print("=== WaveDromProject Test Suite ===\n")
    
    tests = [
        test_signal_file,
        test_reg_file,
        test_raw_string,
        test_invalid_inputs,
        test_attribute_extraction
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n=== Test Results ===")
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1


if __name__ == "__main__":
    sys.exit(main()) 