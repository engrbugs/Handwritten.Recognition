#! /usr/bin/env python

import struct as st
import numpy as np
import matplotlib.pyplot as plt

No_of_image_Read = 100  # -1 is the read full dataset


def main():
    filename = {'images': 'train-images.idx3-ubyte', 'labels': 'train-labels.idx1-ubyte'}
    print(filename['labels'])
    images_file = open(filename['images'], 'rb')
    labels_file = open(filename['labels'], 'rb')

    labels_file.seek(0)
    st.unpack('>4B', labels_file.read(4))

    l_img = st.unpack('>I', labels_file.read(4))[0]  # Number of Labels

    # labels_array
    labels_array = np.asarray(st.unpack('>' + 'B' * l_img,
                                        labels_file.read(l_img))).reshape(l_img)
    print(labels_array[2])

    images_file.seek(0)
    magic = st.unpack('>4B', images_file.read(4))
    print(magic)

    img = st.unpack('>I', images_file.read(4))[0]  # num of images
    nr = st.unpack('>I', images_file.read(4))[0]  # num of rows
    nc = st.unpack('>I', images_file.read(4))[0]  # num of column

    if No_of_image_Read != -1:
        img = No_of_image_Read

    # List all the label here:
    label_output = ""
    for i in range(img):
        label_output = label_output + "Index" + str(i) + ": " + str(labels_array[i]) + ", "
    print(label_output)

    print(img)
    print(nr)
    print(nc)
    print('>' + 'B' * img*28*28)
    # images_array = np.zeros((Img, nR, nC)) Dimension of the array

    nbytestotal = img * nr * nc * 1  # since each pixel data is 1 byte
    images_array = 255 - np.asarray(st.unpack('>' + 'B' * nbytestotal,
                                              images_file.read(nbytestotal))).reshape((img, nr, nc))
    print(images_array)
    print(len(images_array))
    print(images_array[0])

    # Plotting 2x2 image (Showing all #1 image)
    plt.subplot(2, 2, 1)
    plt.imshow(images_array[6], cmap='gray')
    plt.subplot(2, 2, 2)
    plt.imshow(images_array[8], cmap='gray')
    plt.subplot(2, 2, 3)
    plt.imshow(images_array[14], cmap='gray')
    plt.subplot(2, 2, 4)
    plt.imshow(images_array[99], cmap='gray')

    plt.show()


if __name__ == "__main__":
    main()
