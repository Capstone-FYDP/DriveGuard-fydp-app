import pandas as pd
import matplotlib.pyplot as plt
import torch
import numpy as np
from torch import nn
import torch.nn.functional as F
from torchvision import  transforms, models
from collections import OrderedDict
from PIL import Image


class ResNet34(nn.Module):
    def __init__(self,num_classes,pretrained=True):
        super().__init__()
        # Use a pretrained model
        self.network = models.resnet34(pretrained=pretrained)
        # Replace last layer
        self.network.fc = nn.Linear(self.network.fc.in_features, num_classes)

    def forward(self,x):
        return self.network(x)

        
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def loadModel():
    model = ResNet34(num_classes=10)
    device = torch.device('cpu')
    model.load_state_dict(torch.load('./assistaML_Model.pth', map_location=device))
    return model, device

def predict(model, image, device):

    image = transform(image).unsqueeze(0)
    with torch.no_grad():
        model.eval()
        output = model(image.to(device))
        _, preds = torch.topk(output, k=10)
        for i in range(preds.size(1)):
            class_idx = preds[0][i]
            class_confidence = torch.exp(output[0][class_idx]) / torch.sum(torch.exp(output[0]))
            return ("{} {}".format(class_idx, class_confidence.item()*100))

def getClassficiations(class_idx):
   mapping = {
       '0': 'safe driving', 
       '1': 'texting - right', 
       '2': 'talking on the phone - right', 
       '3': 'texting - left', 
       '4': 'talking on the phone - left', 
       '5': 'operating the radio', 
       '6': 'drinking', 
       '7': 'reaching behind', 
       '8': 'hair and makeup', 
       '9': 'talking to passenger' 
   }

   return mapping[class_idx]

