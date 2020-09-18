import test from '/tests/tape.js';
import convertTo from '/convertTo.js';

// Generator:
// console.log(encode(true))
const unknownVersionExample = '["T,-3"]';
const nonArrayExample = 'true';

// Generator:
// const largeArray = [];
// for (let a = 0; a < 100; a += 1) {
//     largeArray.push(a);
// }
// const data = {
//     int: 1,
//     circular: void 0,
//     nan: NaN,
//     infinity: Infinity,
//     largeArray: largeArray,
// };
// data.circular = data;
// console.log(encode(data));
const v1Example = '[["Ob",[[["St0","St1","St2","St3","St4"],["Nu0","Ob0","Na","pI","Ar0"]]]],["St",["int","circular","nan","infinity","largeArray"]],["Nu",["1","0","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60","61","62","63","64","65","66","67","68","69","70","71","72","73","74","75","76","77","78","79","80","81","82","83","84","85","86","87","88","89","90","91","92","93","94","95","96","97","98","99"]],["Ar",[[["Nu1","Nu0","Nu2","Nu3","Nu4","Nu5","Nu6","Nu7","Nu8","Nu9","Nu10","Nu11","Nu12","Nu13","Nu14","Nu15","Nu16","Nu17","Nu18","Nu19","Nu20","Nu21","Nu22","Nu23","Nu24","Nu25","Nu26","Nu27","Nu28","Nu29","Nu30","Nu31","Nu32","Nu33","Nu34","Nu35","Nu36","Nu37","Nu38","Nu39","Nu40","Nu41","Nu42","Nu43","Nu44","Nu45","Nu46","Nu47","Nu48","Nu49","Nu50","Nu51","Nu52","Nu53","Nu54","Nu55","Nu56","Nu57","Nu58","Nu59","Nu60","Nu61","Nu62","Nu63","Nu64","Nu65","Nu66","Nu67","Nu68","Nu69","Nu70","Nu71","Nu72","Nu73","Nu74","Nu75","Nu76","Nu77","Nu78","Nu79","Nu80","Nu81","Nu82","Nu83","Nu84","Nu85","Nu86","Nu87","Nu88","Nu89","Nu90","Nu91","Nu92","Nu93","Nu94","Nu95","Nu96","Nu97","Nu98","Nu99"]]]],["r","Ob0"],["v","1.0.0"]]';
const v2Example = '["O0,2",["O","S0S1S2S3S4 N0O0$6$4A0"],["S",["int","circular","nan","infinity","largeArray"]],["N","7_{/f>|vr[}f&;*;7;b;f;j;n;r;v;z;&<*<7<b<f<j<n<r<v<z<&=*=7=b=f=j=n=r=v=z=&>*>7>b>f>j>n>r>v>z>&?*?7?b?f?j?n?r?v?z?&@*@7@b@f@j@n@r@v@z@&[*[7[b[f[j[n[r[v[z[&]*]7]b]f]j]n]r]v]z]&^*^7^b^f^j^n^r^v^z^!"],["A","N1N0N2N3N4N5N6N7N8N9NaNbNcNdNeNfNgNhNiNjNkNlNmNnNoNpNqNrNsNtNuNvNwNxNyNzN!N#N%N&N\'N(N)N*N+N-N.N/N:N;N<N=N>N?N@N[N]N^N_N`N{N|N}N~N10N11N12N13N14N15N16N17N18N19N1aN1bN1cN1dN1eN1fN1gN1hN1iN1jN1kN1lN1mN1nN1oN1pN1qN1rN1sN1tN1uN1vN1wN1xN1yN1z"]]';

test('ConvertTo: From 1.0.0 to 2 and back', (t) => {
    t.plan(2);

    const v2Result = convertTo(v1Example, '2');

    t.equal(v2Example, v2Result);
    t.equal(v1Example, convertTo(v2Result, '1.0.0'));
});

test('ConvertTo: From 2 to 1.0.0 and back', (t) => {
    t.plan(2);

    const v1Result = convertTo(v2Example, '1.0.0');

    t.equal(v1Example, v1Result);
    t.equal(v2Example, convertTo(v1Result, '2'));
});

test('ConvertTo: From 1.0.0 to 1.0.0 returns the same value back', (t) => {
    t.plan(1);

    const v1Result = convertTo(v1Example, '1.0.0');

    t.equal(v1Example, v1Result);
});

test('ConvertTo: From 2 to 2 returns the same value back', (t) => {
    t.plan(1);

    const v2Result = convertTo(v2Example, '2');

    t.equal(v2Example, v2Result);
});

test('ConvertTo: Trying to convert from unknown version throws', (t) => {
    t.plan(1);

    try {
        convertTo(unknownVersionExample, '2');
        t.ok(false);
    } catch (e) {
        t.equal(e.message, 'Cannot determine version of encoded json-complete data. Are you using an version of convertTo older than your data?');
    }
});

test('ConvertTo: Trying to convert to unknown version throws', (t) => {
    t.plan(1);

    try {
        convertTo(v1Example, '-3.0.0');
        t.ok(false);
    } catch (e) {
        t.equal(e.message, 'No encoder found for expected output version of json-complete data. Are you sure you have specified the correct output version? The available conversions are: 1.0.0, 2');
    }
});

test('ConvertTo: Trying to convert non-array JSON throws', (t) => {
    t.plan(1);

    try {
        convertTo(nonArrayExample, '2');
        t.ok(false);
    } catch(e) {
        t.equal(e.message, 'Encoded data is not in Array form. Cannot determine version of encoded json-complete data.');
    }
});

if (typeof BigInt64Array === 'function') {
    test('ConvertTo: Test converting to previous version that does not support a new type added to a later version', (t) => {
        t.plan(1);

        const v2WithNewType = '["A0,2",["A","BI0"],["BI","I0I1"],["I",":v8"]]';

        try {
            convertTo(v2WithNewType, '1.0.0');
            t.ok(false);
        } catch (e) {
            t.equal(e.message, 'Cannot encode unsupported type "BigInt64Array".');
        }
    });
}
