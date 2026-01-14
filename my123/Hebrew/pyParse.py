import csv
import sys
#import pandas as pd


# eg: python pyParse.py sample.csv "my_foo('hello')"
def my_cut(current_row, lh_pairs):
    last_index = len(lh_pairs) - 1
    result = "{"
    for my_index2, (label, header) in enumerate(lh_pairs):
        # print(f"label: {label}, header: {header}, content: {current_row[header]}")
        result += f"{label}:{safe_quote(first_up(current_row[header]))}"

        if my_index2 == last_index:
            result += "}"
        else:
            result += ","
    return result


def first_up(my_input):
    result = my_input
    if my_input[0].isalpha():
        result = my_input[0].upper() + my_input[1:]
    return result


def safe_quote(my_input):
    """Helper function to calculate the average of a list of numbers."""
    return '"' + my_input.replace('"', '\\"') + '"'


def pair_to_header(my_pair):
    label, header = my_pair
    return safe_quote(header)


def cut_helper(my_pairs, columns, data):
    # df = pd.read_csv(csv_file)
    # for index, row in df.iterrows():
    # print(f"Index: {index}, RabbinicTerm: {row['Name']}, Age: {row['Age']}, City: {row['City']}")

    with open(csv_file, 'r') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        rows_list = list(csv_reader)
        num_rows = len(rows_list)

        if csv_reader.fieldnames:
            header_row = ",".join(list(map(pair_to_header, my_pairs)))
            print(f"let {columns} = [{header_row}];")
            print(f"let {data} = [")
            for my_index, (row) in enumerate(rows_list):
                row_output = my_cut(row, my_pairs)
                if my_index < num_rows-1:
                    row_output += ","
                print(row_output)

            print("];")

        else:
            print("No headers found in the CSV file.")
            exit(1)


def unmissing():
    pairs = [('word', 'word'),
             ('phrase', 'phrase'), ('phraseMeaning', 'phraseMeaning')]
    cut_helper(pairs, 'un_columns', 'un_data')


def solution():
    pairs = [('word', 'RabbinicTerm'), ('meaning', 'Term(English)'),
             ('phrase', 'PhraseContext'), ('phraseMeaning', 'PhraseContext (English)')]
    cut_helper(pairs, 'columns', 'data')


def test():
    pairs = [('word', 'RabbinicTerm'), ('phrase', 'PhraseContext')]
    cut_helper(pairs, 'columns', 'data')


def study():
    solution()
    # pairs = [('word', 'RabbinicTerm'), ('meaning', 'Term(English)')]
    # cut_helper(pairs, 'columns', 'data')


if __name__ == "__main__":
    if len(sys.argv) > 1:
        csv_file = sys.argv[1]
        #print(f"Input CSV: {csv_file}")
    else:
        print("No CSV provided.")
        print(f"Usage: {sys.argv[0]} <csv-file> [test | study | solution]")
        exit(1)

    if len(sys.argv) > 2:
        my_func = sys.argv[2] + "()"
    else:
        my_func = "solution()"

    eval(my_func)
