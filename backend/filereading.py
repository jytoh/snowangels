import pandas as pd
import os.path
from pandas import ExcelWriter
from pandas import ExcelFile
from pyproj import Proj, transform


def fetchGISdata(filename, dir='\\GIS data', sheet='Ints2019'):
    #expects excel file; default arguments should cover ver 1
    p= os.path.abspath(os.pardir)
    p+=dir
    file=p+"\\"+filename
    df = pd.read_excel(file, sheet_name=sheet,engine='xlrd')
    cols=df.columns.values
    latlongdf=pd.DataFrame()
    #extract xy from dataframe
    #run
    for index,row in df.iterrows():
        x1=row[2]
        y1=row[3]
        x2,y2=convertXYtoLatLong(x1,y1)
        #it's swapping lat and long and i don't know why
        s=pd.Series(data=[row[0],row[1],y2,x2,row[4], row[5]])
        latlongdf=latlongdf.append(s,ignore_index=True)
        print(latlongdf)
    return latlongdf

def convertXYtoLatLong(x1,y1):
    latlongespg= 'epsg:4326'
    nycentralespg='epsg:2261'
    outproj = Proj(init=latlongespg)
    inproj = Proj(init=nycentralespg,preserve_units=True)
    x2,y2=transform(inproj,outproj,x1,y1)
    return(x2,y2)
