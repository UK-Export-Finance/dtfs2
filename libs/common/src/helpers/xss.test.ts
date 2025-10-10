import { xssClean } from './xss';

describe('xssClean', () => {
  const stringAssertions = [
    {
      input: '',
      output: '',
    },
    {
      input: '123',
      output: '123',
    },
    {
      input: '<123>',
      output: '&lt;123&gt;',
    },
    {
      input: '<script>alert();</script>',
      output: '',
    },
    {
      input: '<object src = "data:1234">',
      output: '',
    },
    {
      input: '<h1>test</h1>',
      output: 'test',
    },
    {
      input: '123&123',
      output: '123&123',
    },
    {
      input: '<img src = "data:ABC123" />',
      output: '',
    },
    {
      input: 'This is a test case of AVG(123) and MAX(123)!!@ for £123.123 at %50.123 ^*-+=:"/\\',
      output: 'This is a test case of AVG(123) and MAX(123)!!@ for £123.123 at %50.123 ^*-+=:"/\\',
    },
    { input: '<a href="javascript:alert(1)">click</a>', output: 'click' },
    { input: '<img src=x onerror=alert(1)>', output: '' },
    { input: '<iframe src="javascript:alert(1)"></iframe>', output: '' },
    { input: '<div onclick="alert(1)">click</div>', output: 'click' },
    { input: '<svg onload=alert(1)>svg</svg>', output: 'svg' },
    { input: '"> <script>alert(1)</script>', output: '"&gt; ' },
    { input: 'Tom &amp; Jerry', output: 'Tom & Jerry' },
    { input: '<style>body{background:url("javascript:alert(1)");}</style>', output: '' },
  ];

  it.each(stringAssertions)('should return cleansed output when the input supplied is type of `string` %s', (value) => {
    // Arrange
    const { input, output } = value;

    // Act
    const response = xssClean(input);

    // Assert
    expect(typeof input).toBe('string');
    expect(response).toBe(output);
  });

  const arrayAssertions = [
    {
      input: [],
      output: [],
    },
    {
      input: ['123', '<script>alert(1)</script>', '<h1>Hi</h1>'],
      output: ['123', '', 'Hi'],
    },
    {
      input: ['<img src=x onerror=alert(1)>', 'Safe text', '<object>bad</object>'],
      output: ['', 'Safe text', 'bad'],
    },
    {
      input: ['Tom & Jerry', '<div onclick="alert()">click</div>'],
      output: ['Tom & Jerry', 'click'],
    },
    { input: ['hello', '<b>bold</b>', '<script>alert(1)</script>'], output: ['hello', 'bold', ''] },
    { input: ['<img src="x" onerror="alert(1)">', 'data:text/html;base64,PHNj...'], output: ['', 'data:text/html;base64,PHNj...'] },
    { input: ['<a href="javascript:alert(1)">click</a>', '<a href="https://ok">ok</a>'], output: ['click', 'ok'] },
    { input: ['<svg onload=alert(1)>TEXT-SVG</svg>', '<svg><text>t</text></svg>'], output: ['TEXT-SVG', 't'] },
    { input: ['<style>body{background:url("javascript:alert(1)");}</style>', 'safe'], output: ['', 'safe'] },
    { input: ['&lt;notatag&gt;'], output: ['&lt;notatag&gt;'] },
    { input: ['<123>', '<!----> <!-- comment -->', '<unknown>text</unknown>'], output: ['&lt;123&gt;', ' ', 'text'] },
    { input: ['%3Cscript%3Ealert(1)%3C%2Fscript%3E', 'normal'], output: ['%3Cscript%3Ealert(1)%3C%2Fscript%3E', 'normal'] },
    { input: ['Tom &amp; Jerry', '£100 & 50%'], output: ['Tom & Jerry', '£100 & 50%'] },
    { input: ['<div><span>foo</span></div>', '<div><img src=x></div>'], output: ['foo', ''] },
    { input: ['<button onclick="evil()">press</button>', '<input value="ok">'], output: ['press', ''] },
    {
      input: ['Hello <script>evil()</script> World', '<a href="jav\u0061script:alert(1)">js</a>', 'Safe <b>bold</b> &amp; fine'],
      output: ['Hello  World', 'js', 'Safe bold & fine'],
    },
  ];

  it.each(arrayAssertions)('should return cleansed output when the input supplied is type of `array` %o', (value) => {
    // Arrange
    const { input, output } = value;

    // Act
    const response = xssClean(input);

    // Assert
    expect(Array.isArray(input)).toBeTruthy();
    expect(response).toEqual(output);
  });

  const objectAssertions = [
    // empty object input
    {
      input: {},
      output: {},
    },
    // simple fields
    { input: { name: '<h1>Alice</h1>', bio: '<script>alert(1)</script>' }, output: { name: 'Alice', bio: '' } },
    // nested object with arrays
    {
      input: {
        user: '<b>Bob</b>',
        tags: ['<img src=x onerror=1>', 'dev', '<div>ok</div>'],
        meta: { note: '<iframe src="javascript:alert(1)"></iframe>' },
      },
      output: {
        user: 'Bob',
        tags: ['', 'dev', 'ok'],
        meta: { note: '' },
      },
    },

    // deep nesting
    {
      input: {
        level1: {
          level2: {
            val: '<span onclick="x()">deep</span>',
            empty: '<object></object>',
          },
          arr: ['<h2>head</h2>', '<script>bad()</script>'],
        },
      },
      output: {
        level1: {
          level2: { val: 'deep', empty: '' },
          arr: ['head', ''],
        },
      },
    },
    // href/javascript and safe href
    { input: { link: '<a href="javascript:alert(1)">pwn</a>', ok: '<a href="https://ok">ok</a>' }, output: { link: 'pwn', ok: 'ok' } },
    // data URI / image removed
    { input: { logo: '<img src="data:image/png;base64,AAA...">', alt: 'site' }, output: { logo: '', alt: 'site' } },
    // style block removed, ampersand decoded
    { input: { style: '<style>h1{}</style>', title: 'Title &amp; Stuff' }, output: { style: '', title: 'Title & Stuff' } },
    // encoded entities mixed with raw script encoded form
    {
      input: { encoded: '&lt;script&gt;alert(1)&lt;/script&gt;', raw: '&#60;script&#62;alert(1)&#60;/script&#62;' },
      output: { encoded: '&lt;script&gt;alert(1)&lt;/script&gt;', raw: '&lt;script&gt;alert(1)&lt;/script&gt;' },
    },
    // weird keys and broken tags
    { input: { '<weird>': '<123>', value: '<unknown>inner</unknown>' }, output: { '<weird>': '&lt;123&gt;', value: 'inner' } },
    // safe arrays with punctuation/currency
    { input: { notes: ['Amt: £1,234.56', 'Percent: 50% & more'] }, output: { notes: ['Amt: £1,234.56', 'Percent: 50% & more'] } },
    // WYSIWYG paste / mixed content
    {
      input: {
        content: [
          '<p>Normal text</p>',
          '<p><img src=x onerror=alert(1)>broken image</p>',
          { caption: '<strong>Caption</strong>', meta: '<script>evil</script>' },
        ],
      },
      output: {
        content: ['Normal text', 'broken image', { caption: 'Caption', meta: '' }],
      },
    },
    // JSON-like string should remain escaped
    { input: { jsonString: '{"name":"<b>Joe</b>","age":30}' }, output: { jsonString: '{"name":"Joe","age":30}' } },
    // SVG and onload attribute
    { input: { graphic: '<svg onload=alert(1)>X</svg>', caption: '<svg><text>t</text></svg>' }, output: { graphic: 'X', caption: 't' } },
    // CSS url javascript inside style removed
    { input: { css: '<style>body{background:url("javascript:alert(1)");}</style>' }, output: { css: '' } },
    // mixed encoded and plain ampersands
    { input: { title: 'Tom &amp; Jerry', desc: 'A & B' }, output: { title: 'Tom & Jerry', desc: 'A & B' } },
    // anchor with nested tags
    { input: { link: '<a href="javascript:alert(1)"><b>Click</b></a>' }, output: { link: 'Click' } },
    // attribute-based XSS in inputs preserved inner value
    { input: { field: '<input value="ok">' }, output: { field: '' } },
    // broken HTML fragments become escaped text or preserved inner text
    { input: { frag1: '<123>', frag2: '<div>hi' }, output: { frag1: '&lt;123&gt;', frag2: 'hi' } },
    // mixture of safe text and dangerous tags in same field
    { input: { mixed: 'Hello <script>evil()</script> World <b>Yes</b>' }, output: { mixed: 'Hello  World Yes' } },
    // nested arrays + objects complex
    {
      input: {
        multi: [{ a: '<h3>Title</h3>', b: ['<script>bad</script>', 'ok', { c: '<img src=x>' }] }, 'plain'],
      },
      output: {
        multi: [{ a: 'Title', b: ['', 'ok', { c: '' }] }, 'plain'],
      },
    },
  ];

  it.each(objectAssertions)('should return cleansed output when the input supplied is type of `object` %o', (value) => {
    // Arrange
    const { input, output } = value;

    // Act
    const response = xssClean(input);

    // Assert
    expect(typeof input).toBe('object');
    expect(response).toEqual(output);
  });
});
