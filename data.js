const data = {
  "Variants": [
    { "name": "Base", "index": "0" },
    { "name": "Gold", "index": "1" },
    { "name": "Diamond", "index": "2" },
    { "name": "Rainbow", "index": "3" },
    { "name": "Beskar", "index": "4" },
    { "name": "Galactic", "index": "5" },
    { "name": "Stellar", "index": "6" },
    { "name": "Kyber", "index": "7" }
  ],
  "Paths": [
    {
      "Path number": "1",
      "bots_per_rebirth": [
        {
          "Rebirth": "0 > 1",
          "bots": [
            { "variant": "Base", "type": "CB" },
            { "variant": "Base", "type": "Pit" },
            { "variant": "Base", "type": "DRK-1 Probe" }
          ]
        },
        {
          "Rebirth": "1 > 2",
          "bots": [
            { "variant": "Base", "type": "BDX Explorer" },
            { "variant": "Base", "type": "2BB" },
            { "variant": "Base", "type": "BAL-Core" }
          ]
        },
        {
          "Rebirth": "2 > 3",
          "bots": [
            { "variant": "Base", "type": "A-LT" },
            { "variant": "Base", "type": "B-U4D" },
            { "variant": "Gold", "type": "R9" }
          ]
        },
        {
          "Rebirth": "3 > 4",
          "bots": [
            { "variant": "Gold", "type": "ARG" },
            { "variant": "Gold", "type": "B1 Security" }
          ]
        }
      ]
    }
    // ... other paths ...
  ]
};