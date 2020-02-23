lines = open('data_last.txt').read().splitlines()
f= open("guru99.txt","w+")
for line in lines:
    list_line = line.split(',')
    list_line_cut = list_line[0:18]
    list_line_cut_new = ','.join(list_line_cut).replace('[', '').replace(']', '').replace("'", '')
    f.write(list_line_cut_new + "\n")
