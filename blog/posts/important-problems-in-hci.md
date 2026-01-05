Richard hamming, the famous mathematician and computer scientist in Bell Lab, used to sit at the lunch table of researchers in chemistry and ask them what are the important problems in their field.
He believed that one ought to work on the important problems in their field to maximize the impact of their work. To do this, one needs to first have a clear understanding of what are the important problems they should work on.
It is a deceptively simple question that is yet quite challenging to answer.
Because there are likely many kinds of unimportant problems in a field that people still want to work on for various reasons. Maybe a topic is recently popular and attention-grabbing. Maybe one has already been working on certain topics thus the inertia to continue down that path. Or maybe some are just personally interested on those topics. it’s understandable that one is too pre-occupied to work on any of these kinds of topics while being oblivious of thinking about what are the ones that are really important with respect to the whole field.

## Important Problems for HCI

So, what are the important problems in HCI?

I think for HCI, there are two additional difficulties to answer this question. 

first, in order for a problem to be an important one of a field, it foremost needs to be this field's problem, which means solving this problem requires this field's intellectual core---something that other fields don't have.
In physics, one such problem could be unifying gravity with quantum mechanics. In computer science, it could be achieving artificial general intelligence.
HCI, however, is interdisciplinary. It is symbiotic with other fields, meaning that its intellectual core is (partially) derivative of or dependent on another field's, e.g., user modeling from cognitive science, human subject studies from psychology, ui development from programming language and computer graphics. 
therefore, it is almost impossible for HCI to claim a problem of its own like what physics and computer science do.
for HCI to answer hamming's question, there'd be a different interpretation of the term "problem".

even if we ignore this issue about intellectual core, there is secondary difficulty in identifying important problems in hci.
for HCI, since the field is very diverse and interdisciplinary, it is likely that different people will identify different important problems. For individual researchers, this might not be an issue but for a field collectively  that presents a fundamental challenge. If everyone is working on different important problems, borrowing Hamming's metaphor, it’s like sailors steering the ship towards different directions. Eventually, efforts get canceled out and the ship is sailing nowhere.

to overcome these two difficulties, i propose that HCI should expand the scope of problems beyond the field itself, towards adjacent or broader fields.
For example, one adjacent field of HCI is AI and both are situated in the broader field of CS. People working on “human-AI interaction” (whatever that means) can ask themselves what are the important problems in AI or CS that I, as an HCI researcher, con contribute to solving.
However, identifying adjacent fields will suffer from the second difficulty (lack of unification)--—for example, people working on design or social computing might not identify AI or CS as their meaningful adjacent fields to solve problems in.
Perhaps, we need to go broader instead (go broader go home?). How about humanity as a whole? Maybe HCI ought to identify important problems that matter to the entire humanity and ask ourselves, what are a subset of these problems that, we, as HCI researchers, can and should uniquely contribute to solving.

But Is it too ambitious for HCI to claim those humanity-level problems—e.g., climate, health, education—as our problems? I don’t think so. First, since solving all these problems will involve humans using some sorts of computing technology (e.g., AI),  HCI seems just the right fit to play a role.

## Tackling Problems in an HCI way--the Three Fundamental Questions

Then, the next question is, in solving these problems, what are the foundational HCI-related building blocks---things that would require HCI to contribute to? 
My answers below are biased towards the research I have done with approaches I have deemed appropriate. But here they are.


In general, any HCI research problem will always involve humans using some sorts of computing technology (hereafter referred to as "technology"), which will be imbued with ever-growing intelligence, thus incurring these three questions:

Q1. The Assimilation problem: How can human and technology fully understand each other?

Q2. The Alignment problem: How can the inner-working of a technology align with users’ values?  

Q3. The Augmentation problem: How can a technology be used in a way that augments users’ abilities?

i believe these questions are important because they are the foundational building blocks that make up the full cycle of humans interacting with a technology.

Start from the human expressing their intent (e.g., typing in a command, saying a sentence, making a gesture) in a way that the technology can understand (Q1a---assimilating human intents).
Once the human intent is understood, the technology will act on it in a way that both achieves the intent (Q3) and conforms to human values (Q2).
For example, if a user intends for the technology to improve a piece of writing, the technology foremost needs to help them achieve this goal without plagiarizing others’ text, thus aligning with human values of integrity.
The way technology helps with improving writing can either be a direct rewrite of the original text, or be providing guidance to help the human improves the text on its own (the latter aims to augment the human's ability rather than just augmenting their work).
Once the technology finishes its work, it needs to presents the results in a way that the human can understand (Q1b---assimilating technology output). For example, it can present an improved version of the input writing with changes highlighted to show how improvements have been made.


to summarize, unlike other fields with an intellectual core, hci's symbiotic and diverse nature suggests that it should seek to contribute to problems that are important in broader context (\eg humanity), by addressing the three fundamental questions that serve as building blocks of how humans interact with computing technology to tackle those problems.

## A Case Study: HCI for Scientific Discovery

to walk the walk rather than just talk the talk, i'd like to show how i came to identify and work on one important problem in an HCI way: supporting scientific discovery


why scientific discovery? first, because it is an important problem. it is the breakthroughs in science that resulted in the quantum leaps in the history of humanity: Newton's laws, Darwanian theory of evolution, penicillin,  Watson and Crick's discovery of DNA, and the recent surge of AI. amidst the massiveness of universe, we are fortunate enough to have been existing as a species and a civilization. we owe it to ourselves to stay ambitious and to never stop expanding the boundary of our knowledge. however, just because we have witnessed so many scientific discoveries in the history of humanity does not mean that scientific discoveries will automatically happen in the future. quite the opposite, as we aim to tackle new scientific challenges (e.g., migrating to Mars, expanding human health span), the work becomes much more challenging. we cannot expect to just repeat what scientists have been doing in the past and new discoveries will come through. we need to ramp up and improve how we do science to a new level in order to have new breakthrough discoveries. to achieve this, it takes more than the scientists themselves. other forces need to join too. now, the advent of AI is joining forces. HCI should too. 

as a concrete example, one of our projects focuses on drug discovery, aiming to support its initial phase of identifying drug target, i.e., which protein is (perhaps indirectly) implicated in a certain disease that a drug can bind to and interact with to inhibit the disease. consider Alzheimer's disease, the type of protein Tau is well-known to be implicated. however, Tau might not necessarily be the best target for a drug, considering the possibilities of drugging a large number of other proteins that can interact with Tau. in other words, target ID is the process of finding possible alternative proteins through which a drug can have an effect on Tau, which is the primary culprit for Alzheimer's disease. 

in order to find such proteins, scientists have to consider 





Back to Richard hamming. It turned out that his simple question annoyed most of the chemistry people and he no long could sit at their lunch table.
unfornately, i will not have the opportunity to have lunch with Hamming. but assuming i did, i hope i'd be ready to answer this question.

<!-- RECYCLED -->

<!-- But first, let’s unpack this question a bit more. -->
<!-- while it is up to researchers in each field to decide on what important problems are, there are some implicit requirements for a problem to be qualified as a field's important problem. -->
<!-- first,  -->
<!-- here i want to propose a set of problems that i believe are important to HCI. admittedly, these problems are biased towards the research I have done with approaches I have deemed appropriate. neither do this set encompass all important problems nor would everyone in HCI agree that they are important. after all, whoever's answer will always be somewhat religious rather than representative of some universally truth. -->