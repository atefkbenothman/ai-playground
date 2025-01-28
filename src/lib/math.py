
def add_numbers(num1: float, num2: float) -> float:
    """
    Adds two numbers together and returns the result.
    
    Args:
        num1 (float): The first number to add
        num2 (float): The second number to add
        
    Returns:
        float: The sum of num1 and num2
        
    Raises:
        TypeError: If either num1 or num2 are not numbers
    """
    try:
        return num1 + num2
    except (TypeError, ValueError):
        return "Error: Both inputs must be numbers"

# Example usage
if __name__ == "__main__":
    print(add_numbers(5, 3))       # Outputs: 8
    print(add_numbers(5.5, 3.2))    # Outputs: 8.7
    print(add_numbers(10, 2.5))      # Outputs: 12.5
    print(add_numbers("a", 5))      # Outputs: Error message
      