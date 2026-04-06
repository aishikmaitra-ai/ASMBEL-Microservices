import requests
import pandas as pd
import numpy as np

# with open("file.txt","wb") as f:
#     file=f.read().strip()

# def load_data(file):
#     df=pd.read_csv(file)
#     return df
# def process(file):
#     with open(file, "r", encoding="utf-8") as f:
#         file1 = f.read().strip()
#     data=load_data(file1)
#     for i in data.columns:
#         if i in ['A','B']:
#             data.drop(i)
#     return data


def load_data(file_path):
    df = pd.read_csv(file_path)
    return df

def process(file_path):
    data = load_data(file_path)

    for i in data.columns:
        if i in ['A', 'B']:
            data = data.drop(columns=[i])   # ✅ fix drop

    return data