import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { getTableData, deleteTableItem } from '@store/content/reducer'
import { VisuallyHidden } from '@strapi/design-system/VisuallyHidden'
import { IconButtonGroup, IconButton } from '@strapi/design-system/IconButton'
import { Box } from '@strapi/design-system/Box'
import { Flex } from '@strapi/design-system/Flex'
// import { Button } from '@strapi/design-system/Button'
import { Table, TFooter, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system/Table'
import { Typography } from '@strapi/design-system/Typography'
import Plus from '@strapi/icons/Plus'
import Pencil from '@strapi/icons/Pencil'
import Trash from '@strapi/icons/Trash'
import CarretDown from '@strapi/icons/CarretDown'
import CarretUp from '@strapi/icons/CarretUp'
// import Filter from '@strapi/icons/Filter'
import ConfirmModal from '@components/ConfirmModal'
import { NextLink, Pagination, PreviousLink } from '@strapi/design-system/Pagination'
import Avatar from '@components/Avatar'
import { Select, Option } from '@strapi/design-system/Select'

const pageSize = 20
// const FilterOperations = [
//   'is',
//   'is not',
//   'is lower than',
//   'is lower than or equal',
//   'is bigger than',
//   'is bigger than or equal'
// ]

export default function ContentTable ({ table }) {
  const { tableName = table, page = 1 } = useParams()
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  // const [filterAreaOpen, setFilterAreaOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState({})
  const [sortKey, setSortKey] = useState('id')
  const [sortDirection, setSortDirection] = useState('desc')

  const [visibleColumns, setVisibleColumns] = useState([])
  const [allColumns, setAllColumns] = useState([])

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const tableData = useSelector(state => {
    const res = state.content.tableData[tableName]
    if (res && res.data) return res
    return { data: [] }
  })

  const attributes = useSelector(state =>
    state.content.schemas
      .find(i => i.tableName === tableName)?.attributes
  ) || {}

  const onSetColumns = cols => {
    if (cols.length === 0) {
      return
    }

    setVisibleColumns(cols)
    try {
      let tableConfig = window.localStorage.getItem('bared-admin-table-config')
      if (tableConfig) {
        tableConfig = JSON.parse(tableConfig)
        tableConfig[tableName] = cols
        window.localStorage.setItem('bared-admin-table-config', JSON.stringify(tableConfig))
      } else {
        window.localStorage.setItem('bared-admin-table-config', JSON.stringify({
          [tableName]: cols
        }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const setColumnToDefault = () => {
    const all = ['id', 'created_at']
    let visible = ['id', 'created_at']

    const tableConfig = window.localStorage.getItem('bared-admin-table-config')
    if (tableConfig && JSON.parse(tableConfig)[tableName]) {
      visible = JSON.parse(tableConfig)[tableName]
    } else {
      for (const i in attributes) {
        all.push(i)
        if (attributes[i].tableConfig?.defaultShow) {
          visible.push(i)
        }
      }
    }

    for (const i in attributes) {
      all.push(i)
    }

    setVisibleColumns(visible)
    setAllColumns(all)
  }

  useEffect(() => {
    setColumnToDefault()
  }, [attributes, tableName])

  // const onFilterColumnChange = e => {
  //   console.log(e)
  // }

  // const onFilterTypeChange = e => {
  //   console.log(e)
  // }

  useEffect(() => {
    setSortKey('id')
    setSortDirection('desc')
  }, [tableName])

  useEffect(() => {
    if (tableName) {
      dispatch(getTableData({
        tableName,
        page: parseInt(page),
        pageSize,
        sortKey,
        sortDirection
      }))
    }
    // TODO: fix table change but sortKey out of range in next table
  }, [tableName, page, sortKey, sortDirection])

  const handleItemDelete = item => {
    setDeleteItem(item)
    setConfirmModalOpen(true)
  }

  const onDelete = () => {
    dispatch(deleteTableItem({ tableName, id: deleteItem.id }))
  }

  const onConfirm = () => {
    setConfirmModalOpen(false)
    onDelete()
  }

  const onAddClick = () => {
    navigate(`/content-detail/${tableName}/add`)
  }

  const onRowClick = item => {
    navigate(`/content-detail/${tableName}/${item.id}`)
  }

  const onSortClick = attr => {
    if (sortKey === attr) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(attr)
    }
  }

  const { data, count } = tableData
  const isFirstPage = parseInt(page) === 1
  const isLastPage = parseInt(page) === Math.ceil(count / pageSize)

  return (
    <Box padding={8} background='neutral100'>
      <Typography variant='alpha'>{tableName.toUpperCase()}</Typography>
      <Box paddingBottom={4}>
        <Typography variant='epsilon'>{`${count} items found.`}</Typography>
      </Box>

      <Box paddingBottom={4}>
        <Select
          label='Columns'
          placeholder='Choose columns to show'
          value={visibleColumns}
          onChange={onSetColumns}
          multi
          withTags
        >
          {allColumns.map(item => <Option key={item} value={item}>{item}</Option>)}
        </Select>
      </Box>

      <Table
        colCount={6}
        rowCount={10}
        footer={(
          <TFooter icon={<Plus />} onClick={onAddClick}>
            Add another field to this data type
          </TFooter>
        )}
      >
        <Thead>
          <Tr>
            {visibleColumns.map(attr => {
              return (
                <Th
                  key={attr}
                  action={<IconButton icon={sortKey === attr ? (sortDirection === 'desc' ? <CarretDown /> : <CarretUp />) : <div />} noBorder />}
                  onClick={() => onSortClick(attr)}
                  className='pointer'
                >
                  <Typography variant='sigma'>{attr}</Typography>
                </Th>
              )
            })}
            <Th><VisuallyHidden>Actions</VisuallyHidden></Th>
          </Tr>
        </Thead>
        {
          data && data.length > 0 &&
            <Tbody>
              {data.map(item => {
                return (
                  <Tr key={item.id}>
                    {
                      visibleColumns.map(attr => {
                        const attrSetting = attributes[attr]
                        let cell = item[attr]
                        if (cell && typeof cell === 'object') {
                          cell = JSON.stringify(cell).slice(0, 10) + '...'
                        }

                        if (typeof cell === 'undefined') {
                          cell = ''
                        }

                        if (attrSetting?.tableConfig?.showAsAvatar && cell) {
                          return (
                            <Td key={attr} onClick={() => onRowClick(item)} className='pointer'>
                              <Avatar src={cell} alt='table-avatar' />
                            </Td>
                          )
                        }

                        if (typeof cell === 'string' && cell.length > 16) {
                          cell = cell.slice(0, 16) + '...'
                        }
                        return (
                          <Td key={attr} onClick={() => onRowClick(item)} className='pointer'>
                            {cell}
                          </Td>
                        )
                      })
                    }
                    <Td>
                      <IconButtonGroup>
                        <IconButton onClick={() => onRowClick(item)} label='Edit' icon={<Pencil />} />
                        <IconButton onClick={() => handleItemDelete(item)} label='Delete' icon={<Trash />} />
                      </IconButtonGroup>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
        }
      </Table>
      <Flex justifyContent='flex-end' paddingBottom={4} paddingTop={4}>
        <Pagination activePage={parseInt(page)} pageCount={Math.ceil(count / pageSize)}>
          {
            !isFirstPage &&
              <PreviousLink to={`/content/${tableName}/${parseInt(page) - 1}`}>Previous</PreviousLink>
          }
          {
            !isLastPage &&
              <NextLink to={`/content/${tableName}/${parseInt(page) + 1}`}>Next</NextLink>
          }
        </Pagination>
      </Flex>

      <ConfirmModal
        show={confirmModalOpen}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={onConfirm}
      />
    </Box>
  )
}
