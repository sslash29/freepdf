// Combine two PDF-style affine matrices [a,b,c,d,e,f], same convention as pdfjs Util.transform.
export default function combinePdfTransforms(outerMatrix, innerMatrix) {
  const [aOuter, bOuter, cOuter, dOuter, eOuter, fOuter] = outerMatrix;
  const [aInner, bInner, cInner, dInner, eInner, fInner] = innerMatrix;

  return [
    aOuter * aInner + cOuter * bInner,
    bOuter * aInner + dOuter * bInner,
    aOuter * cInner + cOuter * dInner,
    bOuter * cInner + dOuter * dInner,
    aOuter * eInner + cOuter * fInner + eOuter,
    bOuter * eInner + dOuter * fInner + fOuter,
  ];
}
