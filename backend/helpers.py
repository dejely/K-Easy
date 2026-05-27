def get_universe(variable_count: int) -> list[int]:
    return list(range(2**variable_count))


def unique_sorted(values: list[int]) -> list[int]:
    return sorted(set(values))


def to_bits(value: int, width: int) -> str:
    return format(value, "b").zfill(width)


def count_ones(pattern: str) -> int:
    return len([bit for bit in pattern if bit == "1"])


def literal_count(pattern: str) -> int:
    return len([bit for bit in pattern if bit != "-"])


def is_all_dont_care(pattern: str) -> bool:
    return all(bit == "-" for bit in pattern)