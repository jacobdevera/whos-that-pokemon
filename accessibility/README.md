# Accessibility Challenge

This folder contains code for a web page presenting an academic research paper, created as part of the Accessibility Challenge.

The below questions should be answered regarding your submission!

##### Are the validator services reporting any errors for your site? Why are these "false positives"? #####
> The W3C Validator reports many warnings for elements that do not need a "role" attribute. It's a false positive, because since they are
technically unnecessary, we are using ARIA roles to make web pages more accessible.

AChecker reports <i> tags in "in situ" and suggests to use <strong> or <em> instead, but <i> is proper use for Latin terms; it's not
meant to be emphasized. It also reports <i> tags for p-values, but as it is a technical term it needs <i>. All of the ommitted sections
are reported as well, but the assignment tells us to ignore these and not consider them errors.

##### What are the answers to your reading quiz questions? #####
> 1. Probing
2. More likely
3. Google


##### Did you complete any optional extensions to this assignment? If so, what? #####
> No


##### Did you receive help from any other sources (classmates, etc)? If so, please list who (be specific!). #####
> No


##### Approximately how many hours did it take you to complete this assignment? #####
> 11 hours


##### On a scale of 1 (too easy) to 10 (too challenging), how difficult was this assignment? #####
> 7


##### Did you encounter any problems in this assignment we should warn students about in the future? How can we make the assignment better? #####
> Being clear on what kinds of tags actually need ARIA roles would've helped, as some tags do not have exact corresponding ARIA roles which can
make it seem like a grey area sometimes.
