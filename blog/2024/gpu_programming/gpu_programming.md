---
title: GPU programming (for Deep Learning)
date: December 2024
tagline: In this post we explore what GPU programming is, why it's done, how, and (almost) everything you should consider to do it right.
description: An introduction to GPU programming: kernels, threads, blocks, and performance considerations.
og_description: An introduction to GPU programming: kernels, threads, blocks, and performance considerations.
copyright: © 2024 Jesus M. Antonanzas. All rights reserved.
---

## Motivation & what you'll learn

When NVIDIA was first created in 1993, its focus was on developing graphics processing hardware for the gaming and multimedia markets. Their GPUs (Graphics Processing Units) were initially designed to accelerate 3D graphics rendering, a computationally intensive task that benefits from parallel processing. As NVIDIA's GPUs evolved, they became increasingly powerful parallel processors capable of handling complex mathematical operations.

NVIDIA recognized the potential of GPUs for general-purpose computing beyond graphics, leading to the development of CUDA (Compute Unified Device Architecture) in 2006. CUDA allowed programmers to harness the parallel processing power of NVIDIA GPUs for scientific and engineering computations, data analysis, and other tasks that could benefit from massive parallelism.

The field of Deep Learning, whose algorithms date back to the 1980s and even earlier in some forms, experienced a significant boost as NVIDIA's GPUs became more powerful and accessible. Deep learning algorithms, particularly neural networks, require large amounts of data and significant computational resources to train, and GPUs proved to be well-suited for these tasks due to their parallel architecture.

In 2012, Alex Krizhevsky, Ilya Sutskever, and Geoffrey Hinton used NVIDIA GPUs to train AlexNet, a deep convolutional neural network. AlexNet achieved groundbreaking results in the ImageNet Large Scale Visual Recognition Challenge, significantly outperforming previous methods and demonstrating the power of deep learning combined with GPU computing. This was a pivotal moment: it showed the world that GPUs could dramatically accelerate the training of deep neural networks, making previously impractical models feasible.

As a result of this and subsequent developments, the intersection between GPUs and Deep Learning has become a cornerstone of modern AI research and applications. GPUs (and other accelerators) are now the standard hardware for training and deploying deep learning models. PyTorch, JAX and others are frameworks that leverage CUDA, and virtually all systems use NVIDIA hardware. Other products are emerging though (AMD, Intel, Cerebras, ...), so this near-monopolistic situation is expected to change in the (very?) near future. Of course, hardware alone does not make a model; in the same manner that algorithms alone don't, either (although the compute scaling debate sometimes seems to say otherwise).

That being said, understanding GPU architecture and programming is a critical and powerful skill, as GPUs are the backbone of the systems that run our models. For people like me, that develop DL systems, understanding the underlying hardware is essential. But anyone working with models, be it for training or inference, can benefit from understanding how their GPU works: after all, your GPU is the one doing the work!

In this post, we will explore the basics of GPU programming: how they work, how to program them, and what to consider to do so effectively. We will use CUDA as our reference point, as it is the most widely used framework for GPU programming today, but the concepts are applicable to other frameworks and hardware as well.

*[Remaining sections are under development.]*

## References

```references
[
  {"id": "attention", "author": "Vaswani et al", "year": "2017", "title": "Attention Is All You Need", "url": "https://arxiv.org/pdf/1706.03762"}
]
```
