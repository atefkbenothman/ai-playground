
"""Utility module for basic arithmetic operations."""

def add_numbers(a: int, b: int) -> int:
    """Returns the sum of two numbers.
    
    Args:
        a (int): The first number to add
        b (int): The second number to add
        
    Returns:
        int: The sum of a and b
    """
    return a + b

if __name__ == "__main__":
    # Example usage
    result = add_numbers(5, 3)
    print(f"5 + 3 = {result}")  # Outputs: 5 + 3 = 8
      