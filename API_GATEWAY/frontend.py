import streamlit as st
from gate_llm import route_prompt

st.set_page_config(
    page_title="Microservice API_Handler",
    page_icon="😊", 
    layout="centered"
        
)



st.title("Microservices Demo App")
st.markdown("""This is a basic Demo app of microservices\nYou have two options here: \n\n # 1. Upload a policy \n\n #2. Upload your data""")
user_input=st.text_area("Enter the text please:")
if user_input.lower() == "exit":
    #st.write("Exiting... 👋")
    st.success("Exited Successfully")
else:
    reply=route_prompt(user_input)
st.markdown("The reply of the current query:")
st.write("Rerouting to required service:")
st.write(reply)