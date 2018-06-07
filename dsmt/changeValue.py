__author__ = 'Yulong Liang'

from random import randint

def changeValue():
    """
    Function which reads the original OFF file and 
    write the new OFF file with random values in the
    scaler field
    """
    filename = input('Please enter the file name: ')

    with open(filename) as f:
        test = f.read().splitlines() 

    result = test[0] + '\n' + test[1]

    for i in range(2,len(test)):
        row = test[i].split(' ')
        row[-1] = str(randint(0,30))
        temp = ' '.join(row)
        result = result + '\n' + temp

    newfilename = filename.split('.')[0] + '_new.off'

    with open(newfilename, 'w') as g:
        g.write(result)


if __name__ == '__main__':
    changeValue()