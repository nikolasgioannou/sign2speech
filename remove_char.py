label_lines = open('./labels/tian_labels_7.txt').read().splitlines()

j_indices = []

for line_index in range(0, len(label_lines)):
    if label_lines[line_index] == "25":
        j_indices.append(line_index)
        
data_lines = open('./data/tian_data_7.txt').read().splitlines()

f=open("newdata.txt","w+")

for line_index in range(0, len(data_lines)):
    if line_index not in j_indices:
        f.write(data_lines[line_index] + "\n")
        
f.close()

t=open("newlabels.txt","w+")

for label_line_index in range(0, len(label_lines)):
    if label_line_index not in j_indices:
        t.write(label_lines[label_line_index] + "\n")
        
