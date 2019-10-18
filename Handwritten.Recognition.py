#! /usr/bin/env python

import struct as st
import numpy as np
import matplotlib.pyplot as plt
# from keras.datasets.mnist import load_data


no_of_image_Read = 100  # -1 is the read full dataset
training_Sets = []
label_of_Training_array = []

training_Filename = 'train-images.idx3-ubyte'
label_Training_Filename = 'train-labels.idx1-ubyte'
test_Filename = 't10k-images.idx3-ubyte'
test_label_Filename = 't10k-labels.idx1-ubyte'


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
    global image_height
    global image_width
    image_width, image_height = nr, nc
    # NOTE: image_height == image_width == 28

    if no_of_image_Read != -1:
        img = no_of_image_Read

    # List all the label here:
    label_output = ""
    for i in range(img):
        label_output = label_output + "Index" + str(i) + ": " + str(label_of_Training_array[i]) + ", "
    print(label_output)

    print(img)
    # images_array = np.zeros((Img, nR, nC)) Dimension of the array

    nbytestotal = img * nr * nc * 1  # since each pixel data is 1 byte
    global training_Sets
    training_Sets = 255 - np.asarray(st.unpack('>' + 'B' * nbytestotal,
                                               images_file.read(nbytestotal))).reshape((img, nr, nc))

def plot_images():
    # display 4 random images from the training set and 4 from the test set
    np.random.see


    # display 14 random images from the training set
    np.random.seed(123)

    rand_14 = np.random.randint(0, train_digits.shape[0], 14)
    sample_digits = train_digits[rand_14]
    sample_labels = train_labels[rand_14]
    # code to view the images
    num_rows, num_cols = 2, 7
    f, ax = plt.subplots(num_rows, num_cols, figsize=(12, 5),
                         gridspec_kw={'wspace': 0.03, 'hspace': 0.01},
                         squeeze=True)

    for r in range(num_rows):
        for c in range(num_cols):
            image_index = r * 7 + c
            ax[r, c].axis("off")
            ax[r, c].imshow(sample_digits[image_index], cmap='gray')
            ax[r, c].set_title('No. %d' % sample_labels[image_index])
    plt.show()
    plt.close()

    import matplotlib.pyplot as plt
    fig = plt.figure()
    for i in range(9):
        plt.subplot(3, 3, i + 1)
        plt.tight_layout()
        plt.imshow(X_train[i], cmap='gray', interpolation='none')
        plt.title("Digit: {}".format(y_train[i]))
        plt.xticks([])
        plt.yticks([])
    fig


def main():
    open_datasets()
    plot_images()
    # some variables...
    num_channels = 1  # we have grayscale images

    # re-shape the images data
    train_data = np.reshape(training_Sets, (training_Sets.shape[0], image_height, image_width, num_channels))
    # test_data = np.reshape(test_digits, (test_digits.shape[0], image_height, image_width, num_channels))
    print('l')
    train_data = train_data.astype('float32') / 255.
    print('l')

if __name__ == "__main__":
    main()
