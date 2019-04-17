# Fork

`Fork` is a React component for rendering collections efficiently.

## Props

**selector**: A reducer or selector which contains an array

**render**:

**getKey** (optional):

## Renders

`Fork` does not render any container div- rather, it returns a `Fragment` containing a list of all the rendered items in the collection. This means `Fork` will not disrupt your styling or DOM semantics.

## Examples

```javascript
function Comment({ getComments, getComment }){
  return <div>
    <Fork selector={getTodos} render={getComment => }/>
  </div>
}






```
