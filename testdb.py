import xlrd
import pandas
from pandas import ExcelWriter
from pandas import ExcelFile

df= pandas.read_excel('INTERSECTIONSsample.xlsx', sheetname='Sheet1')
#depending on what we want to use and how we want to use it, we can convert
#the data frame directly into a table with something like sqlalchemy
data = df.to_dict()
print(data)
