#! /usr/bin/env python

import struct as st
import numpy as np


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
    print(labels_array[0])

    images_file.seek(0)
    magic = st.unpack('>4B', images_file.read(4))
    print(magic)

    img = st.unpack('>I', images_file.read(4))[0]  # num of images
    nr = st.unpack('>I', images_file.read(4))[0]  # num of rows
    nc = st.unpack('>I', images_file.read(4))[0]  # num of column

    # images_array = np.zeros((Img, nR, nC)) Dimension of the array

    nbytestotal = img * nr * nc * 1  # since each pixel data is 1 byte
    images_array = 255 - np.asarray(st.unpack('>' + 'B' * nbytestotal,
                                              images_file.read(nbytestotal))).reshape((img, nr, nc))
    print(images_array)
    print(len(images_array))
    print(images_array[0])


if __name__ == "__main__":
    main()
