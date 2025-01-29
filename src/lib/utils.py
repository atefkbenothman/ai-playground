def add_numbers(a: float, b: float) -> float:
    """
    Adds two numbers together
    
    Args:
        a (float): The first number to add
        b (float): The second number to add
        
    Returns:
        float: The sum of a and b
    """
    return a + b

if __name__ == "__main__":
    # Example usage
    print("2 + 3 =", add_numbers(2, 3))  # Output: 5
    print("1.5 + 2.5 =", add_numbers(1.5, 2.5))  # Output: 4.0
    print("-1 + 5 =", add_numbers(-1, 5))  # Output: 4