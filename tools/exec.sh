export INPUT_MAJORVERSION=1
export INPUT_MINORVERSION=1
export INPUT_PATCHVERSION=1
export INPUT_VERSIONNUMBERBUMB="<bmp-vrsn>"
#export INPUT_WORKINGDIRECTORY="/full-git"
export INPUT_INCREMENTMINORBRANCHREGEX="feat(|ure|ures)\/[a-zA-Z0-9-_]+"
export INPUT_INCREMENTPATCHBRANCHREGEX="(hot|bug|)fix(es|)/[a-zA-Z0-9-_]+"

rm task.js
tsc
node task.js