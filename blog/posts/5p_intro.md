# The 5P Approach of Writing the Introduction of an HCI Paper
<!--  -->
<!-- TLDR -->

Introduction is perhaps the most important and heavily read section of a research paper.
While there is no universal formula of writing good introductions, for [technical HCI](https://link.springer.com/chapter/10.1007/978-1-4939-0378-8_4) papers, I have found it useful to address the following points (dubbed as *5P*'s):

- **Promise**: What is a technology that promises us something good?
- **Problem**: What is the problem that prevents this technology from realizing its promise?
- **Prior work**: What is the most representative set of prior work that has attempted to solve this problem and why did it fail?
- **Proposed solution**: What is your proposed solution given where prior work fell short?
- **Proof of contribution**: What is your proof to validate that your proposed solution contributes to solving that problem?

## Dissecting an example of a 5P-introduction
Let's look at an example of a 5P-introduction from this [paper](https://drive.google.com/file/d/1nmvrkm6l1ueSIIKYXQcTC2sWSCyXEY5V/view) that presents a tool for interactive exploration and discovery of editing directions enabled by Generative Adversarial Networks.

### Promise
> Generative Adversarial Networks (GANs) promise to create new content by learning the characteristics of existing data, showing compelling results in various domains, from stylization [32], scene creation [26], and improving the quality of scientific data [22].

The promise aims to motivate the work by contextualizing it in an important broader technological area, i.e., GANs that can better our abilities to create new contents in various domains.

In general, there are two kinds of promises that can open an introduction.
1. How a new and emergent technology can lead us to something good in the future (the above example); or
2. Something good that already exists somewhere but remains unavailable or limited somewhere else (e.g., humans can reliably recognize each other's faces but computer vision algorithms still struggle).

### Problem
> Unfortunately, despite its increasing widespread use, most GAN models to date remain a ‘black box’ to end-users with little transparency about what a model is capable of generating and little control over the generative process. Without transparency and control, when end-users have a creative intent (e.g., a caricaturist illustrating a character’s facial expression in creative storytelling), they cannot see whether or how one can instruct a GAN model as-is to generate specific characteristics.

Then comes the twist: we can't have that promise yet because of a problem---GANs' lack of transparency and user control.
By this point, you'd want your reader to feel the urge of wanting this problem solved.

One important consideration is to make sure that you state the real problem. 
For example, GANs lack transparency and user control---so what? Why is this a problem? What harms does it cause?
To make a stronger case, you need to follow up by describing the consequences of lacking transparency and user control.
To make sure that you have said the real problem, one useful techniques is to keep asking yourself "so what?"


### Prior work
> To address the limited transparency and control, some prior work allows a user to browse GAN-generated results in an interactive gallery view [31]; however, such an open-ended exploration is not intended to converge to a specific direction. Others propose methods to dissect a GAN model [1] or to perform post hoc extraction of principal components [8] or semantic controls [5]. However, such directions are often pre-defined by algorithms, which do not permit a user to specify directions to generate their own desired characteristics.

Before you jump to your own solution, you need to give your reader the lay of the land: what are some existing solutions to make GANs more transparent and controllable.
There are two important considerations.

1. Instead of an extensive literature review (which should be in its own section), you want to briefly highlight the "nearest neighbors"---a few examples of prior work that is most competitive with your proposed solution. 
Rather than describing each individual paper, you can also characterize the most competitive prior work by assigning them to categories followed by a few representative citations.

2. All the mentioning of prior work here should eventually lead to a realization that there remains a significant gap between what has been achieved and what needs to be done to solve the aforementioned problem.
This gap will set the scene for introducing your own solution.

### Proposed solution
> We design and implement GANzilla—a tool that complements existing algorithm-driven approaches by enabling user-driven direction discovery in a GAN model. ...
>
> As shown in Figure 1a, a GANzilla user starts with brushing on a few exemplar images demonstrating specifc areas they want to stylize, based on which the back-end samples a large number of directions. ...
<!-- As a proof of concept, we focus on a common use case of stylizing faces based on the StyleGAN2 model [13]; however, the workflow in our tool is expected to generalize to other usages of GAN as well. -->

You can start with a one-sentence description of your solution, followed by more details to unpack that sentence, such as referring to your Figure 1 (teaser figure) to walk through a typical interaction scenario of the tool.
There is no universally best formula to write this part because it highly depends on the nature of your work in this paper. 


### Proof of contribution
> We validate GANzilla in a user study (N = 12) with two types of tasks: ... Results show that participants were able to fnd the GAN directions that closely replicated the edits— specifically, their discovered directions transformed the reference images into ones that are more similar to the target images and such similarities rank high when compared to edits done by 1000 randomly-sampled directions (representing the latent space). ...
> 
> Overall, GANzilla makes a tool contribution: ...

Following the pitch of your solution, a reader would expect to see some proof to back up your claim.
While this part's writing also varies due to different ways of evaluations, the general rule of thumb is to be as specific as possible within the brevity constraint of the introduction. 
For example, in addition to saying you ran a study with N participants who used the tool to do some tasks, also summarize the key findings (including numbers, if applicable)._

## The Provenance of 5P's
The 5P method is largely inspired by Scott Hudson's *POTS* approach of writing an introduction that consists of *Promises*, *Obstacles*, and *Technical Solutions*.
The addition of the *Prior work* part is inspired in part by [this paper](https://dl.acm.org/doi/10.1145/1978942.1979058) that iteratively introduces schools of prior work and explains why they are insufficient in solving the problem.
<!-- - saul's start with "In our everyday life ..."; "the problem is ..." -->

## Final thoughts
The 5P approach aims to establish a best practice of writing the introduction of an HCI paper. Rather than having to craft a new introduction every time you write a paper, you can spearhead the writing process by structuring your thoughts using the 5P's and perhaps quickly get the first draft out. In this way, hopefully you can spend less time on writing about your work and more on doing the actual work.