import unittest

from backend.solver import (
    build_kmap,
    generate_verilog_module,
    parse_term_list,
    solve_boolean_function,
    validate_terms,
)


class SolverTests(unittest.TestCase):
    def test_parse_term_list_reports_bad_values(self):
        parsed = parse_term_list("1, 1, x, 9", "Minterms", 7)

        self.assertEqual(parsed["values"], [1])
        self.assertIn("Minterms value 1 is repeated.", parsed["errors"])
        self.assertIn('Minterms contains "x", which is not a whole number.', parsed["errors"])
        self.assertIn("Minterms value 9 is outside 0-7.", parsed["errors"])

    def test_validate_terms_reports_overlap(self):
        errors = validate_terms([1, 3], [3])

        self.assertEqual(
            errors,
            ["Minterms and don't-cares overlap at 3. Keep each term in only one list."],
        )

    def test_two_variable_sample_solves_to_b(self):
        result = solve_boolean_function(2, ["A", "B"], [1, 3], [])

        self.assertEqual(result["sop"]["expression"], "B")
        self.assertEqual(result["sop"]["verilogExpression"], "B")
        self.assertEqual(result["pos"]["expression"], "(B)")
        self.assertEqual(result["truthTable"][1]["value"], "1")

    def test_kmap_uses_gray_code_order(self):
        kmap = build_kmap(4, [0], [15])

        self.assertEqual(kmap["rowLabels"], ["00", "01", "11", "10"])
        self.assertEqual(kmap["colLabels"], ["00", "01", "11", "10"])
        self.assertEqual(kmap["cells"][0][0]["value"], "1")
        self.assertEqual(kmap["cells"][2][2]["value"], "X")

    def test_constant_zero_and_one_outputs(self):
        zero_result = solve_boolean_function(2, ["A", "B"], [], [])
        one_result = solve_boolean_function(2, ["A", "B"], [0, 1, 2, 3], [])

        self.assertEqual(zero_result["sop"]["constant"], "0")
        self.assertEqual(zero_result["pos"]["constant"], "0")
        self.assertEqual(one_result["sop"]["constant"], "1")
        self.assertEqual(one_result["pos"]["constant"], "1")

    def test_verilog_module_generation(self):
        code = generate_verilog_module(
            "boolean_solver",
            ["A", "B"],
            [{"name": "Y", "expression": "B"}],
        )

        self.assertIn("module boolean_solver(A, B, Y);", code)
        self.assertIn("assign Y = B;", code)


if __name__ == "__main__":
    unittest.main()
