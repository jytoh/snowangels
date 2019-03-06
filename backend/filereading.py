import pandas as pd
import os.path
from pandas import ExcelWriter
from pandas import ExcelFile



def fetchGISdata(filename, dir='\\GIS data', sheet='\\Sheet1'):
    #expects excel file; default arguments should cover ver 1
    p= os.path.abspath(os.pardir)
    p+=dir
    file=p+filename
    df = pd.read_excel(p, sheetname=sheet)
    return df
