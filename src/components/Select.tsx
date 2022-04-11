import {RadioGroup} from '@headlessui/react'

export interface Option {
    name: string,
    value: string,
}

interface IProps {
    selectText: string,
    optionList: Option[]
    selectedObject: Option,
    setSelectedObject: (value: Option) => void,
}

function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}

export default function Select(props: IProps) {

    const {selectText, optionList, selectedObject, setSelectedObject} = props;

    return (<div className="mt-10">
        <div className="flex items-center justify-between">
            <h4 className="text-sm text-gray-900 font-medium">{selectText}</h4>
        </div>

        <RadioGroup key={selectText} value={selectedObject} onChange={setSelectedObject} className="mt-4">
            <div className="grid grid-cols-4 gap-4">
                {optionList.map((option: Option) => (
                    <RadioGroup.Option
                        key={option.name}
                        value={option}
                        className={({active}) =>
                            classNames(
                                'bg-white shadow-sm text-gray-900 cursor-pointer',
                                active ? 'ring-2 ring-indigo-500' : '',
                                'group relative border rounded-md py-3 px-4 flex items-center justify-center text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1'
                            )
                        }
                    >
                        {({active, checked}) => (
                            <>
                                <RadioGroup.Label as="p">{option.name}</RadioGroup.Label>
                                <div
                                    className={classNames(
                                        active ? 'border' : 'border-2',
                                        checked ? 'border-indigo-500' : 'border-transparent',
                                        'absolute -inset-px rounded-md pointer-events-none'
                                    )}
                                    aria-hidden="true"
                                />
                            </>
                        )}
                    </RadioGroup.Option>
                ))}
            </div>
        </RadioGroup>
    </div>)
}
