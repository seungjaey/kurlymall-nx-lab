# Install Pacakges
install.packages('tidyverse')
install.packages('tidytext')
install.packages('textdata')
install.packages('ggplot2')
install.packages('readr')

library('tidyverse')
library('tidytext')
library('textdata')
library('ggplot2')
library('readr')

tibble(text = test) %>%
  unnest_tokens(input = text, output = word) %>%
  count(word, sort = T)


getwd()
setwd('/Users/hamtori/kurly/kurlymall-nx-lab/extract-all-review-comments')
data = read.csv2(file = 'COMMENTS_SUBSET.csv', header = F, sep = ",")

head(data)

target = data[1, 4]
tibble(text = target) %>%
  unnest_tokens(input = text, output = word) %>%
  count(word, sort = T)
