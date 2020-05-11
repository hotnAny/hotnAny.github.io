# Ontology development 101: A guide to creating your first ontology

```
@misc{noy2001ontology,
  title={Ontology development 101: A guide to creating your first ontology},
  author={Noy, Natalya F and McGuinness, Deborah L and others},
  year={2001},
  publisher={Stanford knowledge systems laboratory technical report KSL-01-05 and Stanford medical informatics technical report SMI-2001-0880, Stanford, CA}
}
```

## One Sentence
This guide introduces the fundamental concepts of ontology, steps to develop an ontology and design considerations.

## Key Points
#### What is ontology?
> "...––explicit formal specifications of the terms in the domain and relations among them ..."
> "... an ontology is a formal explicit description of concepts in a domain of discourse"

#### Other concepts of ontology
* **Classes** (sometimes called **concepts**: a domain of discourse;
* **Slots** (sometimes **roles** or **properties**): properties of each class describing various features and attributes of the concept;
* **Facets** (sometimes **role restrictions**): restrictions on slots;
* **Knowledge base** = an ontology + a set of individual **instances** of class

#### Why develop and ontology?
> * To share common understanding of the structure of information among people or software agents
> * To enable reuse of domain knowledge
> * To make domain assumption explicit
> * To separate domain knowledge from the operational knowledge
> * To analyze domain knowledge

#### How is ontology different from Object-Oriented Programming
> "Object-oriented programming centers primarily around methods on classes––a programmer makes design decisions based on the operational properties of a class, whereas an ontology designer makes these decisions based on the structural properties of a class. As a result, a class structure and relations among classes in an ontology are different from the structure for a similar domain in an object-oriented program."

#### Basic steps to develop an ontology
> * defining classes in the ontology,
> * arranging the classes in a taxonomic (subclass-superclass) hierachy,
> * defining slots and describing allowed values for these slots,
> * filling in the values for slots for instances.

#### Basic principles of creating ontology
> 1) There is no one correct way to model a domain——there are always viable alternatives. The best solution almost always depends on the application that you have in mind and the extensions that you anticipate.
> 2) Ontology development is ncessarily an iterative process.
> 3) Concepts in the ontology should be close to objects (physical or logical) and relationships in your domain of interest. These are most likely to be nouns (objects) or verbs (relationships) in sentences that describe your domain

#### What are the concrete steps to create an ontology
1. Determine the domain and scope of the ontology
    - What is the domain that the ontology will cover?
    - For what we are going to use the ontology?
    - For what types of questions the information in the ontology should provide answers?
    - Who will use an dmaintain the ontology?
 
2. Consider reusing existing ongology
3. Enumerate important terms in the ontology
    > "It is useful to write down a list of all terms we would like either to make statements about or to explain to a user ... Initially, it is important to get a comprehensive list of terms without worrying about overlap between concepts they represent, relations among the terms, or any properties that the concepts may have, or whether the concepts are classes or slots."
4. Define the classes and the class hierarchy
5. Define the properties of classes——slots
    - "Intrinsic" (e.g., a wine's ```tanning level``` or ```sugar level```)
    - "Extrinsic" (e.g., a wine's ```name``` and the ```area``` it is from)
    - Parts (e.g., different parts of bike, different sections of a thesis)
    - Relationships to other individuals (e.g., ```maker``` of a wine represents its relationship to a winery
6. Define the facets of the slots
    - **Range** refers to a set of classes a property can be, e.g., ```produces``` of a Winery can be Wine;
    - **Domain** refers to a set of classes a property can be part of, e.g., ```tanning level``` can be part of the Red Wine but not the White Wine class.
7. Create instances

#### What are competency questions?
It is "a list of questions that a knowledge base based on the ontology should be able to answer". Sketching a list of competency questions helps to determine the scope of the ontology.

#### Other tips
* The synonym of a concept is not another class——they are different 'pointers' referring to the same class

> "All the siblings in the hierachiy (except for the ones at the root) must be at the same level of generality"

> "In other words, we introduce a new class in the hierachy usually only when there is something that we can say about this class that we cannot say about the superclass"

> "If the concepts with different slot values become restrictions for different slots in other classes, then we should create a new class for the distinction. Otherwise, we represent the distinction in a slot value." This is equivalent to saying a new class is worth creating only if its properties (different from the superclass) actually matter, e.g, wine being white or red matters for food matching in restaurants but not so much for bottle manufacturing in factories.
