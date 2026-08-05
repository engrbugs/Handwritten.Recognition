import numpy as np
import copy
import matplotlib.pyplot as plt
import h5py
from PIL import Image

# This is a sample Python script.

# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.


def model(X_train, Y_train, X_test, Y_test, num_iterations=2000, learning_rate=0.5, print_cost=False):
    w, b = initialize_with_zeros(X_train.shape[0])
    parameters, grads, costs = optimize(w, b, X_train, Y_train, num_iterations, learning_rate, print_cost)
    #parameters, grads, costs = optimize(w, b, X_train, Y_train, num_iterations, learning_rate, print_cost)
    #parameters, grads, costs = optimize(w, b, X_train, Y_train, num_iterations, learning_rate, print_cost)
    w = parameters["w"]
    b = parameters["b"]
    Y_prediction_test = predict(w, b, X_test)
    Y_prediction_train = predict(w, b, X_train)

    # Print train/test Errors
    if print_cost:
        print("train accuracy: {} %".format(100 - np.mean(np.abs(Y_prediction_train - Y_train)) * 100))
        print("test accuracy: {} %".format(100 - np.mean(np.abs(Y_prediction_test - Y_test)) * 100))

    d = {"costs": costs,
         "Y_prediction_test": Y_prediction_test,
         "Y_prediction_train": Y_prediction_train,
         "w": w,
         "b": b,
         "learning_rate": learning_rate,
         "num_iterations": num_iterations}

    return d


def predict(w, b, X):
    m = X.shape[1]
    Y_prediction = np.zeros((1, m))
    w = w.reshape(X.shape[0], 1)
    A = sigmoid(np.dot(w.T, X) + b)
    for i in range(A.shape[1]):
        Y_prediction[0, i] = 1 if A[0, i] > 0.5 else 0

    return Y_prediction


def optimize(w, b, X, Y, num_iterations=100, learning_rate=0.009, print_cost=False):
    w = copy.deepcopy(w)
    b = copy.deepcopy(b)

    costs = []
    dw = 0.0
    db = 0.0
    for i in range(num_iterations):
        grads, cost = propagate(w, b, X, Y)
        dw = grads["dw"]
        db = grads["db"]
        w = w - learning_rate * dw
        b = b - learning_rate * db

        if i % 100 == 0:
            costs.append(cost)

            # Print the cost every 100 training iterations
            if print_cost:
                print("Cost after iteration %i: %f" % (i, cost))

    params = {"w": w,
              "b": b}

    grads = {"dw": dw,
             "db": db}

    return params, grads, costs


def propagate(w, b, X, Y):
    m = X.shape[1]

    A = sigmoid(np.dot(w.T, X) + b)
    cost = (-1 / m) * np.sum(Y * np.log(A) + (1 - Y) * (np.log(1 - A)))  # compute cost

    dw = (1 / m) * np.dot(X, (A - Y).T)
    db = (1 / m) * np.sum(A - Y)

    cost = np.squeeze(np.array(cost))

    grads = {"dw": dw,
             "db": db}

    return grads, cost


def initialize_with_zeros(dim):
    w = np.zeros([dim, 1])
    b = 0
    return w, b


def sigmoid(z):
    s = 1 / (1 + np.exp(-z))
    return s


def open_h5(filename):
    with h5py.File(filename, "r") as f:
        # List all groups
        print("Keys: %s" % f.keys())
        # Get the data
        header = list(f.keys())
        classes = f[header[0]]
        x = f[header[1]]
        y = f[header[2]]
        classes = np.array(classes)
        x = np.array(x)
        y = np.array(y)
        f.close()
    return classes, header, x, y


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    test_classes, test_header, test_set_x, test_set_y = open_h5("test_catvnoncat.h5")
    train_classes, train_header, train_set_x, train_set_y = open_h5("train_catvnoncat.h5")

    index = 25
    plt.imshow(train_set_x[index])
    plt.show()
    print("y = " + str(train_set_y[index]) + ", it's a '" + train_classes[np.squeeze(train_set_y[index])].decode(
        "utf-8") + "' picture.")
    print("total number of " + str(train_header[1]) + ": " + str(train_set_x.shape[0]))
    print("total number of " + str(train_header[2]) + ": " + str(train_set_y.shape[0]))

    train_set_y = train_set_y.reshape(-1, 1).T
    test_set_y = test_set_y.reshape(-1, 1).T

    m_train = train_set_y.shape[1]
    m_test = test_set_y.shape[1]
    num_px = train_set_x.shape[1]

    print("Number of training examples: m_train = " + str(m_train))
    print("Number of testing examples: m_test = " + str(m_test))
    print("Height/Width of each image: num_px = " + str(num_px))
    print("Each image is of size: (" + str(num_px) + ", " + str(num_px) + ", 3)")
    print("train_set_x shape: " + str(train_set_x.shape))
    print("train_set_y shape: " + str(train_set_y.shape))
    print("test_set_x shape: " + str(test_set_x.shape))
    print("test_set_y shape: " + str(test_set_y.shape))

    train_set_x_flatten = train_set_x.reshape(train_set_x.shape[0], -1).T
    test_set_x_flatten = test_set_x.reshape(test_set_x.shape[0], -1).T

    assert np.alltrue(train_set_x_flatten[0:10, 1] == [196, 192, 190, 193, 186, 182, 188, 179, 174,
                                                       213]), "Wrong solution. Use (X.shape[0], -1).T."
    assert np.alltrue(test_set_x_flatten[0:10, 1] == [115, 110, 111, 137, 129, 129, 155, 146, 145,
                                                      159]), "Wrong solution. Use (X.shape[0], -1).T."

    print("train_set_x_flatten shape: " + str(train_set_x_flatten.shape))
    print("train_set_y shape: " + str(train_set_y.shape))
    print("test_set_x_flatten shape: " + str(test_set_x_flatten.shape))
    print("test_set_y shape: " + str(test_set_y.shape))

    train_set_x = train_set_x_flatten / 255
    test_set_x = test_set_x_flatten / 255

    logistic_regression_model = model(train_set_x, train_set_y, test_set_x, test_set_y, num_iterations=3000, learning_rate=0.005, print_cost=True)