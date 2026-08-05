# When Confidence Lies

> An interactive neural-network lab about approximation, confidence, and out-of-distribution inputs.

[Open the live showcase](https://engrbugs.github.io/Handwritten.Recognition/)

[Open the Calculus Foundations page](https://engrbugs.github.io/Handwritten.Recognition/derivatives.html)

![When Confidence Lies neural-network lab](showcase-clean.png)

## The idea

Neural networks do not need to understand an input in order to produce a label. A classifier can be highly confident because one output wins the competition among its known classes—even when the input itself is nonsense.

This project makes that failure mode visible. Draw a digit, load a clean template, or create an unfamiliar shape. The lab shows a simulated activation path, class probabilities, and an explicit out-of-distribution warning.

The point is not that every model is useless. The point is more precise: a softmax score is a preference among labels, not a proof that the input belongs to the training distribution.

## The calculus underneath

The new Calculus Foundations page connects the visual intuition to training:

- **Δy/Δx** is the average slope between two points—the secant line.
- **dy/dx** is the limiting instantaneous slope—the tangent line.
- **∂y/∂x** is a partial derivative when a function has multiple inputs.
- **δy/δx** is context-dependent notation for a finite variation or perturbation; it is not a universal substitute for a derivative.

Move the slider and watch the secant slope converge toward the tangent slope. That same local-slope idea powers gradient descent when a model updates its parameters to reduce loss.

## Explore the lab

1. Load a clean digit and watch the network produce a sharp output.
2. Click **Make nonsense** and compare the classifier's forced answer with the OOD warning.
3. Draw your own shape to see how small changes affect the displayed distribution.
4. Read the three lesson cards below the visual: distribution, approximation, and confidence.

## What is real—and what is illustrative?

The repository began as a Python study of MNIST files and a neural network built while learning the underlying mathematics. The browser experience is a deliberately transparent educational simulation inspired by that work; it is not presented as a newly trained production classifier.

The visual uses a compact hand-tuned demonstration layer so the idea is explorable in a browser with no server, model download, or data upload. The original Python source and MNIST files remain available for continued experimentation.

## Companion experiment

The former `H5FileOpener` project is the companion binary-image lab: it reads the `cat-vs-noncat` HDF5 dataset and walks through a from-scratch logistic-regression training loop. It belongs in the same learning collection, but it should remain a separate experiment inside the collection because its dataset, task, and model are different.

| Lab | Input | Model idea | Status |
| --- | --- | --- | --- |
| Handwritten Recognition | MNIST digits | Image parsing and neural-network foundations | Interactive browser showcase |
| H5 / cat-vs-noncat | HDF5 color images | Logistic regression and gradient descent | Python learning experiment |

## Run locally

The showcase is static:

```bash
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

No package installation is required for the browser lab. The original Python experiment uses NumPy, SciPy, Matplotlib, IPython, Jupyter, pandas, SymPy, and nose as recorded in the historical README.

## Original learning materials

- `Handwritten.Recognition.py` — reads the MNIST IDX image and label files and prepares image tensors
- `train-*.idx*` and `t10k-*.idx*` — MNIST training and test files
- `mnist.npz` — compact NumPy dataset copy
- `index.html`, `styles.css`, `app.js` — the browser lab

The browser page is intentionally self-contained. It does not transmit drawings or collect analytics.

## Context

The larger question behind this project is how to make uncertainty legible. Better architectures may help, and uncertainty estimation can be improved, but no single confidence number should be mistaken for knowledge.

Inspired by the discussion around out-of-distribution failure and the limits of confident classification.

The calculus explanation is an original interactive recreation inspired by the clear derivative intuition taught in Andrew Ng’s courses. No lecture screenshot is reproduced; the page uses its own curve, notation, and visual treatment.

## License

MIT
