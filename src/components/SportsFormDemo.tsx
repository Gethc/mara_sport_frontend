import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SportsFormDemo = () => {
  const examples = [
    {
      title: "Example 1: Team Sport",
      data: {
        sportType: "Team",
        sportName: "Football",
        ageFrom: "U9",
        ageTo: "U19",
        category: "None",
        subCategories: "None",
        gender: "Male"
      }
    },
    {
      title: "Example 2: Individual Sport with Categories",
      data: {
        sportType: "Individual",
        sportName: "Athletics",
        ageFrom: "U9",
        ageTo: "U19",
        category: "Track",
        subCategories: [
          { name: "50m", ageFrom: "U9", ageTo: "U11" },
          { name: "100m", ageFrom: "U12", ageTo: "U14" },
          { name: "200m", ageFrom: "U15", ageTo: "U19" }
        ],
        gender: "Female"
      }
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sports Form Examples</h2>
      <p className="text-muted-foreground">
        These examples demonstrate how the redesigned Add Sports form works with different sport types.
      </p>
      
      {examples.map((example, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">{example.data.sportType}</Badge>
              {example.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Sport Type</h4>
                <p>{example.data.sportType}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Sport Name</h4>
                <p>{example.data.sportName}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Age From</h4>
                <p>{example.data.ageFrom}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Age To</h4>
                <p>{example.data.ageTo}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Category</h4>
                <p>{example.data.category}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Gender</h4>
                <p>{example.data.gender}</p>
              </div>
            </div>
            
            {Array.isArray(example.data.subCategories) && example.data.subCategories.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Sub-Categories</h4>
                <div className="space-y-2">
                  {example.data.subCategories.map((subCat, subIndex) => (
                    <div key={subIndex} className="p-3 bg-muted/30 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Name: </span>
                          <span className="font-medium">{subCat.name}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Age From: </span>
                          <span className="font-medium">{subCat.ageFrom}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Age To: </span>
                          <span className="font-medium">{subCat.ageTo}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SportsFormDemo;
