# H5 File Opener Lab

This companion lab stays inside the `Handwritten.Recognition` project because it explores the same learning path: inspect image data, understand its shape, and build the training loop from first principles.

It opens the included `cat-vs-noncat` HDF5 files, displays a sample image, prints the dataset dimensions, flattens and normalizes the images, then trains a small binary logistic-regression model with gradient descent.

## Run it

From this directory:

```bash
python -m pip install numpy matplotlib h5py pillow
python main.py
```

The script expects these files beside it:

- `train_catvnoncat.h5`
- `test_catvnoncat.h5`

This is a historical learning experiment, not a production image classifier. The browser showcase above is the interactive, no-installation entry point; this folder is where the underlying data-reading and optimization experiment can be run directly.
