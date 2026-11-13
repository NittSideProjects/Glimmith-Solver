# builds small import fixtures from the workshop zip: a bare puzzle, a zip with one puzzle, a zip of folders (stored + deflated), a nested zip, junk
import zipfile, struct, io, sys
src = zipfile.ZipFile(sys.argv[1]); out = sys.argv[2]
ids = [n.split('/')[0] for n in src.namelist() if n.endswith('/puzzle')]
def meta(name, author):
    def s(t): b = t.encode() + b'\0'; return struct.pack('<i', len(b)) + b
    return bytes(20) + s(name) + s('') + s(author)
pz = {i: src.read(i + '/puzzle') for i in ids}
pick = lambda name: next(i for i in ids if name in src.read(i + '/metadata').decode('latin1'))
a, b = pick('Match Shape Puzzle'), pick('1-10')
open(out + '/bare_puzzle', 'wb').write(pz[a])
with zipfile.ZipFile(out + '/one.zip', 'w', zipfile.ZIP_DEFLATED) as z: z.writestr('puzzle', pz[a])
with zipfile.ZipFile(out + '/folders.zip', 'w') as z:
    z.writestr('x1/puzzle', pz[a], zipfile.ZIP_DEFLATED); z.writestr('x1/metadata', meta('<img src=x onerror=alert(1)>', 'Mallory'), zipfile.ZIP_STORED)
    z.writestr('x2/puzzle', pz[b], zipfile.ZIP_STORED); z.writestr('x2/metadata', meta('Second one', 'Bob'), zipfile.ZIP_DEFLATED)
    z.writestr('x2/preview.png', b'\x89PNG' + bytes(50)); z.writestr('__MACOSX/x2/._puzzle', b'junk')
    z.writestr('readme.txt', 'hello')
with zipfile.ZipFile(out + '/nested.zip', 'w') as z: z.writestr('inner.zip', open(out + '/folders.zip', 'rb').read(), zipfile.ZIP_STORED)
open(out + '/junk.txt', 'w').write('VERSION 1\nDIMENSIONS 2 2\nPUZZLE\nnonsense\n')
print('ok', a, b)
