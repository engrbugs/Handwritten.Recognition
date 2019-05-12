#! /usr/bin/env python

import struct as st
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image as mpimg


no_of_image_Read = 100  # -1 is the read full dataset
training_Sets = []
label_of_Training_array = []

training_Filename = 'train-images.idx3-ubyte'
label_Training_Filename = 'train-labels.idx1-ubyte'


def open_datasets():
    filename = {'images': training_Filename, 'labels': label_Training_Filename}
    print(filename['labels'])
    images_file = open(filename['images'], 'rb')
    labels_file = open(filename['labels'], 'rb')

    labels_file.seek(0)
    st.unpack('>4B', labels_file.read(4))

    l_img = st.unpack('>I', labels_file.read(4))[0]  # Number of Labels

    # labels_array
    global label_of_Training_array
    label_of_Training_array = np.asarray(st.unpack('>' + 'B' * l_img, labels_file.read(l_img))).reshape(l_img)
    print(label_of_Training_array[2])

    images_file.seek(0)
    magic = st.unpack('>4B', images_file.read(4))
    print(magic)

    img = st.unpack('>I', images_file.read(4))[0]  # num of images
    nr = st.unpack('>I', images_file.read(4))[0]  # num of rows
    nc = st.unpack('>I', images_file.read(4))[0]  # num of column

    if no_of_image_Read != -1:
        img = no_of_image_Read

    # List all the label here:
    label_output = ""
    for i in range(img):
        label_output = label_output + "Index" + str(i) + ": " + str(label_of_Training_array[i]) + ", "
    print(label_output)

    print(img)
    print(nr)
    print(nc)
    print('>' + 'B' * img * 28 * 28)
    # images_array = np.zeros((Img, nR, nC)) Dimension of the array

    nbytestotal = img * nr * nc * 1  # since each pixel data is 1 byte
    global training_Sets
    training_Sets = 255 - np.asarray(st.unpack('>' + 'B' * nbytestotal,
                                               images_file.read(nbytestotal))).reshape((img, nr, nc))
    print(training_Sets[0])



def main():
    open_datasets()

    print(len(training_Sets))
    print(training_Sets[0])

    """
    # Plotting 2x2 image (Showing all #1 image)
    plt.subplot(2, 2, 1)
    plt.imshow(training_Sets[6], cmap='gray')
    plt.subplot(2, 2, 2)
    plt.imshow(training_Sets[8], cmap='gray')
    plt.subplot(2, 2, 3)
    plt.imshow(training_Sets[14], cmap='gray')
    plt.subplot(2, 2, 4)
    plt.imshow(training_Sets[99], cmap='gray')
    plt.pause(0.05)
    plt.subplot(2, 2, 1)
    plt.imshow(training_Sets[1], cmap='gray')
    plt.subplot(2, 2, 2)
    plt.imshow(training_Sets[2], cmap='gray')
    plt.subplot(2, 2, 3)
    plt.imshow(training_Sets[3], cmap='gray')
    plt.subplot(2, 2, 4)
    plt.imshow(training_Sets[4], cmap='gray')

    plt.show()
    """


    fig, axis = plt.subplots(10, 10, figsize=(8, 8))
    for i in range(10):
        for j in range(10):
            axis[i, j].imshow(X[np.random.randint(0, 5001), :].reshape(20, 20, order="F"),
                              cmap="hot")  # reshape back to 20 pixel by 20 pixel
            axis[i, j].axis("off")




if __name__ == "__main__":
    main()
