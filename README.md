# k4-table-writer
This is a Kirby 4 plugin. It replaces the default writer field with one that supports tables.

https://github.com/rasteiner/k4-table-writer/assets/6684137/ae0d8adb-a8f4-401b-a4de-1d1ba481e4b7

## Support
This is a "one-off" project. No support will be provided. 

## Blueprint
```yml
fields:
  text:
    type: writer
    nodes:
      - paragraph
      - bulletList
      - orderedList
      - table:
          background:
            - '#65AF5D'
            - '#8CC386'
            - '#B2D7AE'
            - '#C5E1C2'
```
