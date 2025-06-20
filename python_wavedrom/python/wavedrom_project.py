"""
WaveDrom Project - Entry point for WaveDrom rendering engine.

This module provides the WaveDromProject class that handles loading, parsing,
and validating WaveDrom JSON5 input files or strings.
"""

import os
import pyjson5
from typing import Union, Dict, Any


class WaveDromProject:
    """
    Entry point for WaveDrom rendering engine.
    
    Handles loading, parsing, and validating WaveDrom JSON5 input.
    Determines diagram type and extracts configuration attributes.
    """
    
    def __init__(self, input_data: str):
        """
        Initialize WaveDromProject with either a file path or raw JSON5 string.
        
        Args:
            input_data (str): Either a file path to a .json5 file or raw JSON5 string
            
        Raises:
            FileNotFoundError: If the file path doesn't exist
            ValueError: If the input is invalid JSON5 or missing required keys
        """
        self.source: Dict[str, Any] = {}
        self.diagram_type: str = ""
        self.config: Dict[str, Any] = {}
        self.head: Dict[str, Any] = {}
        self.foot: Dict[str, Any] = {}
        
        # Determine if input is a file path or raw content
        content = self._get_content(input_data)
        
        # Parse JSON5 content
        self.source = self._parse_json5(content)
        
        # Validate and determine diagram type
        self.diagram_type = self._determine_diagram_type()
        
        # Extract additional attributes
        self._extract_attributes()
    
    def _get_content(self, input_data: str) -> str:
        """
        Determine if input is a file path or raw content and return the content.
        
        Args:
            input_data (str): Input string to evaluate
            
        Returns:
            str: The JSON5 content to parse
            
        Raises:
            FileNotFoundError: If the file path doesn't exist
        """
        # Check if it looks like a file path (contains .json5 extension)
        if input_data.endswith('.json5') or input_data.endswith('.json'):
            # It's a file path - check if it exists
            if os.path.isfile(input_data):
                try:
                    with open(input_data, 'r', encoding='utf-8') as file:
                        return file.read()
                except Exception as e:
                    raise ValueError(f"Error reading file {input_data}: {str(e)}")
            else:
                # File doesn't exist
                raise FileNotFoundError(f"File not found: {input_data}")
        else:
            # Treat as raw JSON5 content
            return input_data
    
    def _parse_json5(self, content: str) -> Dict[str, Any]:
        """
        Parse JSON5 content into a Python dictionary.
        
        Args:
            content (str): Raw JSON5 content
            
        Returns:
            Dict[str, Any]: Parsed dictionary
            
        Raises:
            ValueError: If parsing fails or result is not a dictionary
        """
        try:
            parsed = pyjson5.loads(content)
        except Exception as e:
            raise ValueError(f"[Parse Error]: Invalid JSON5 format - {str(e)}")
        
        if not isinstance(parsed, dict):
            raise ValueError('[Semantic]: The root has to be an Object: "{signal:[...]}"')
        
        return parsed
    
    def _determine_diagram_type(self) -> str:
        """
        Determine the diagram type based on top-level keys in source.
        
        Returns:
            str: The diagram type ('signal', 'assign', or 'reg')
            
        Raises:
            ValueError: If no valid diagram type keys are found or if arrays are invalid
        """
        # Check in priority order as per render-any.js
        if 'signal' in self.source:
            if not isinstance(self.source['signal'], list):
                raise ValueError('[Semantic]: "signal" object has to be an Array "signal:[]"')
            return 'signal'
        elif 'assign' in self.source:
            if not isinstance(self.source['assign'], list):
                raise ValueError('[Semantic]: "assign" object has to be an Array "assign:[]"')
            return 'assign'
        elif 'reg' in self.source:
            # For reg, we don't validate the array type in the JS version
            return 'reg'
        else:
            raise ValueError('[Semantic]: "signal:[...]", "assign:[...]", or "reg:[...]" property is missing inside the root Object')
    
    def _extract_attributes(self):
        """
        Extract config, head, and foot attributes from the source dictionary.
        """
        self.config = self.source.get('config', {})
        self.head = self.source.get('head', {})
        self.foot = self.source.get('foot', {})
    
    def __repr__(self) -> str:
        """String representation of the WaveDromProject instance."""
        return f"WaveDromProject(diagram_type='{self.diagram_type}', keys={list(self.source.keys())})" 