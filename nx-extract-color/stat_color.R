library(rjson)
# setwd('/Users/mk-mac-135/Kurly/nx-extract-tsx/result')
getwd()

json_data_list = fromJSON(
  file = './COLOR_LIST.json',
  method = 'C'
)

data = as.data.frame(matrix(unlist(json_data_list), ncol = 2, byrow = T), stringsAsFactors = F)

colnames(data) = c(
  'Path',
  'color'
)

rm(list = c('json_data_list'))

write.csv(sort(table(data$color), decreasing = T), 'COLOR_FREQ.csv')