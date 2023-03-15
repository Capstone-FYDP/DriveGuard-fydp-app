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
            print("Predicted class: {}, Confidence: {:.2f}%".format(class_idx, class_confidence.item()*100))

def getClassficiations():
   return {'c0': 'safe driving', 'c1': 'texting - right', 'c2': 'talking on the phone - right', 'c3': 'texting - left', 'c4': 'talking on the phone - left', 'c5': 'operating the radio', 'c6': 'drinking', 'c7': 'reaching behind', 'c8': 'hair and makeup', 'c9': 'talking to passenger'}

model, device = loadModel()

image = Image.open('./images/img_100029.jpg')

predict(model, image, device)

