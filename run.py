import requests
import numpy as np
import tensorflow as tf
import threading

new_model = tf.keras.models.load_model('epic_num_reader.h5')
labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'REST']

def get_state_and_predict():
    threading.Timer(0.5, get_state_and_predict).start()
    
    # get state
    response = requests.get("http://10.18.251.51:4567/")
    np_response = np.fromstring(response.text[1:-1], dtype=np.float, sep=', ')[0:18].reshape(1, 18)
    
    # make prediction
    pred = new_model.predict(np_response)
    pred_index = np.argmax(pred)
    print("predicted: ", labels[pred_index])
    print("confidence: ", pred[0][pred_index])
    print()
    print()
    print()
    
 
get_state_and_predict()
