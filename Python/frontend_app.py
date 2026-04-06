import streamlit as st
from  model import process

st.set_page_config(
    page_title="Data Upload",   # 👈 change this
    page_icon="📊",           # optional
    layout="centered"
)

st.title("Data Uploader")
st.markdown(
"""
This is a test purpose Data Loading App

"""
)

uploaded_file = st.file_uploader("Upload a file:")

if uploaded_file:
    if st.button("Start Testing"):
        df=process(uploaded_file)
        st.dataframe(df)
        st.write("This is the required display dataframe")
