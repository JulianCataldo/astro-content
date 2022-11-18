---
'$schema': src/schemas/blog-post.schema.yaml
---

```js:faker
'# ' + faker.lorem.sentence(10)
```

```js:faker
'## ' + faker.lorem.sentence(9)
```

```js:faker
`**${faker.address.city()}**`
```

```js:faker
faker.lorem.sentence(12)
```

```js:faker
'### ' + faker.lorem.sentence(9)
```

```js:faker
`<SomeMap address="${faker.address.city()}" />`
```

---

```js:faker
'> ' + faker.lorem.sentence(10)
```

---

```js:faker
`- ${faker.lorem.sentence(6)}\n- ${faker.lorem.sentence(8)}\n- ${faker.lorem.sentence(10)}`
```

```js:faker
`<SomeTweet id="${faker.helpers.arrayElement(['1590042307163717635','1593680639005315073','1587901468585205760','1578871432700125185'])}" />`
```

```js:faker
'## ' + faker.lorem.sentence(9)
```

```js:faker
faker.lorem.paragraphs(2)
```

```js:faker
'### ' + faker.lorem.sentence(9)
```

```js:faker
`<SomeYoutubeVideo id="${faker.helpers.arrayElement(['xtTy5nKay_Y','BZZ9rGN4GK8','GPelHyt7iJ8','py8nD37SVDU'])}" />`
```

```js:faker
faker.lorem.paragraphs(1)
```

---

```js:faker
faker.date.recent().toLocaleDateString()
```
