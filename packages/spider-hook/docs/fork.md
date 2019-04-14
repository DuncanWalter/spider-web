# Fork

Fork is a React component for rendering collections efficiently.

## Props

## Renders

`Fork` does not render any container div- rather, it returns a `Fragment` containing a list of all the rendered items in the collection. This means `Fork` will not disrupt your styling or dom semantics.

## Examples

```javascript
function Comment({ getComments, getComment }){
  return <div>
    <Fork selector={getTodos} render={getComment => }/>
  </div>
}






```
