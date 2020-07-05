# myexif

Scripts to help organize photos and videos by their EXIF metadata.

- [Installation](#Installation)
- [Usage](#Usage)
  - [normalize](#normalize)
  - [organize](#organize)
  - [set-permissions](#set-permissions)
  - [set-video-dates](#set-video-dates)
  - [update-timezone](#update-timezone)

## Installation

Requires

- [nodejs v12+](https://nodejs.org/)
- [exiftool](https://exiftool.org/)
- [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)

```sh
yarn add global https://github.com/allienx/myexif#master

# or

npm install -g https://github.com/allienx/myexif#master
```

## Usage

```
Usage: myexif [options] [command]

Scripts to help organize photos and videos by their EXIF metadata.

Options:
  -V, --version                             output the version number
  -h, --help                                display help for command

Commands:
  run-all [options] <dir> <dest>            Organizes all photos and videos in <dir> by their date and time into <dest>.
  live-photos [options] <dir>               Find live photo-video pairs and organize them based on their EXIF tag values.
  normalize [options] <filenames...>        Normalize filenames using lowercase and dashes. Uses consistent .jpg extension.
  organize [options] <filenames...>         Organize filenames based on their EXIF tag values.
  set-permissions [options] <filenames...>  Set permissions (chmod) for the matching files.
  set-video-dates [options] <filenames...>  Set values for video dates based on the QuickTime:CreateDate EXIF tag (assumed to be UTC).
  update-timezone [options] <filenames...>  Updates the timezone of the specified EXIF tag for all filenames.
  help [command]                            display help for command
```


### run-all

```
Usage: myexif run-all [options] <dir> <dest>

Organizes all photos and videos in <dir> by their date and time into <dest>.

Options:
  --dry-run   log results without performing any actions (default: false)
  -h, --help  display help for command
```

### live-photos

```
Usage: myexif live-photos [options] <dir>

Find live photo-video pairs and organize them based on their EXIF tag values.

Options:
  --dry-run         log live photo-video pairs without performing any actions (default: false)
  -d, --dest <dir>  the destination directory to move the files into
  -h, --help        display help for command
```

### normalize

```
Usage: myexif normalize [options] <filenames...>

Normalize filenames using lowercase and dashes. Uses consistent .jpg extension.

Options:
  --dry-run   log new file names without performing actions (default: false)
  -h, --help  display help for command
```

### organize

```
Usage: myexif organize [options] <filenames...>

Organize filenames based on their EXIF tag values.

Options:
  --dry-run         log exiftool commands without performing any actions (default: false)
  -d, --dest <dir>  the destination directory to move the files into
  -h, --help        display help for command
```

### set-permissions

```
Usage: myexif set-permissions [options] <filenames...>

Set permissions (chmod) for the matching files.

Options:
  --dry-run          log new permissions without performing actions (default: false)
  -m, --mode <mode>  new permissions as octal string (default: "644")
  -h, --help         display help for command
```

### set-video-dates

```
Usage: myexif set-video-dates [options] <filenames...>

Set values for video dates based on the QuickTime:CreateDate EXIF tag (assumed to be UTC).

Options:
  --dry-run                  log exiftool commands without performing any actions (default: false)
  -t, --timezone <timezone>  set the QuickTime:CreationDate EXIF tag relative to this timezone
  -h, --help                 display help for command
```

### update-timezone

```
Usage: myexif update-timezone [options] <filenames...>

Updates the timezone of the specified EXIF tag for all filenames.

Options:
  --dry-run                      log exiftool commands without performing any actions (default: false)
  -t, --tag <tag>                name of the EXIF tag to update (default: "QuickTime:CreateDate")
  -s, --src-timezone <timezone>  parse the EXIF tag value relative to this timezone (default: "Etc/UTC")
  -n, --new-timezone <timezone>  set the EXIF tag value relative to this timezone
  -h, --help                     display help for command
```
