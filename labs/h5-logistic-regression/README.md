# H5 / cat-vs-noncat

This lab is the cleaned-up home for the former `H5FileOpener` experiment. It uses the classic cat-vs-noncat HDF5 image dataset to demonstrate:

- opening image and label arrays with `h5py`
- flattening image tensors for a linear model
- forward propagation with a sigmoid
- cost calculation and gradient descent
- train/test accuracy inspection

The original Python implementation is preserved in the [H5FileOpener repository](https://github.com/engrbugs/H5FileOpener) while this learning collection is being organized. It is intentionally presented as a companion experiment, not as the same model as the MNIST lab.
